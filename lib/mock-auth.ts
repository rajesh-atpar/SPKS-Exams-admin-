// Mock authentication for development when backend is not available

export type MockUser = {
  id: string;
  email: string;
  fullName: string;
};

export type MockAuthResponse = {
  user?: MockUser;
  token?: string;
  message?: string;
  success?: boolean;
};

// Mock user database
const mockUsers: MockUser[] = [
  {
    id: "1",
    email: "admin@example.com",
    fullName: "Admin User"
  },
  {
    id: "2", 
    email: "user@example.com",
    fullName: "Test User"
  }
];

// Mock passwords (in real app, these would be hashed)
const mockPasswords: Record<string, string> = {
  "admin@example.com": "admin123",
  "user@example.com": "password"
};

function generateMockToken(user: MockUser): string {
  // Simple mock JWT-like token
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ 
    id: user.id, 
    email: user.email, 
    fullName: user.fullName,
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  }));
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
}

export async function mockLogin(payload: { email: string; password: string }): Promise<MockAuthResponse> {
  const { email, password } = payload;
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const user = mockUsers.find(u => u.email === email);
  const storedPassword = mockPasswords[email];
  
  if (!user || !storedPassword || storedPassword !== password) {
    return {
      success: false,
      message: "Invalid email or password"
    };
  }
  
  const token = generateMockToken(user);
  
  return {
    success: true,
    user,
    token,
    message: "Login successful"
  };
}

export async function mockRegister(payload: { email: string; password: string; fullName: string }): Promise<MockAuthResponse> {
  const { email, password, fullName } = payload;
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check if user already exists
  if (mockUsers.find(u => u.email === email)) {
    return {
      success: false,
      message: "User with this email already exists"
    };
  }
  
  // Create new user
  const newUser: MockUser = {
    id: String(mockUsers.length + 1),
    email,
    fullName
  };
  
  mockUsers.push(newUser);
  mockPasswords[email] = password;
  
  const token = generateMockToken(newUser);
  
  return {
    success: true,
    user: newUser,
    token,
    message: "Registration successful"
  };
}
