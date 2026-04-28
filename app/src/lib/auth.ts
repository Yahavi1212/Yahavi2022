import { fetchGraphQL } from "@/lib/graphql-client";
import { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/auth-token";

export interface AuthUser {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  joinedDate?: string;
  isVerified?: boolean;
}

const AUTH_USER_KEY = "hackknow-user";

export const isAuthenticated = (): boolean => {
  return Boolean(getAuthToken() && localStorage.getItem(AUTH_USER_KEY));
};

export const getCurrentUser = (): AuthUser | null => {
  try {
    const user = localStorage.getItem(AUTH_USER_KEY);
    return user ? (JSON.parse(user) as AuthUser) : null;
  } catch {
    return null;
  }
};

const persistSession = (token: string, user: AuthUser) => {
  setAuthToken(token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

export const logout = () => {
  clearAuthToken();
  localStorage.removeItem(AUTH_USER_KEY);
  // Per-user cart will reload empty on next mount
  localStorage.removeItem("hackknow-cart");
};

const LOGIN_MUTATION = `
  mutation Login($username: String!, $password: String!) {
    login(input: { username: $username, password: $password }) {
      authToken
      user {
        id
        databaseId
        email
        firstName
        lastName
        registeredDate
      }
    }
  }
`;

const REGISTER_MUTATION = `
  mutation Register($username: String!, $email: String!, $password: String!, $firstName: String, $lastName: String) {
    registerUser(input: {
      username: $username,
      email: $email,
      password: $password,
      firstName: $firstName,
      lastName: $lastName
    }) {
      user {
        id
        databaseId
        email
        firstName
        lastName
        registeredDate
      }
    }
  }
`;

function userFromNode(node: {
  id?: string;
  databaseId?: number | null;
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
  registeredDate?: string | null;
}, fallbackEmail: string, phone?: string): AuthUser {
  const fullName = [node.firstName, node.lastName].filter(Boolean).join(" ").trim();
  const joined = node.registeredDate
    ? new Date(node.registeredDate).toLocaleString("en-US", { month: "long", year: "numeric" })
    : new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
  return {
    id: node.databaseId ? String(node.databaseId) : node.id,
    name: fullName || (node.email ?? fallbackEmail).split("@")[0],
    email: node.email ?? fallbackEmail,
    phone,
    joinedDate: joined,
    isVerified: true,
  };
}

export async function loginWithWordPress(email: string, password: string): Promise<AuthUser> {
  const data = await fetchGraphQL(LOGIN_MUTATION, { username: email, password });
  const payload = data?.login;
  if (!payload?.authToken || !payload?.user) {
    throw new Error("Invalid login response from server");
  }
  const user = userFromNode(payload.user, email);
  persistSession(payload.authToken, user);
  return user;
}

export async function registerWithWordPress(opts: {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<AuthUser> {
  const [firstName, ...rest] = opts.fullName.trim().split(/\s+/);
  const lastName = rest.join(" ");

  await fetchGraphQL(REGISTER_MUTATION, {
    username: opts.email,
    email: opts.email,
    password: opts.password,
    firstName: firstName || opts.email.split("@")[0],
    lastName: lastName || "",
  });

  // After registration, log in to obtain a JWT
  return loginWithWordPress(opts.email, opts.password);
}
