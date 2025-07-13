// pages/api/auth.js
import prisma from "../../lib/prisma";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  // Only allow POST requests for authentication
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { action, name, email, password, role } = req.body;

    if (action === "register") {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({ error: "User already exists" });
      }
      // Create a new user
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
          data: {
            name: name || "User",
            email,
            password: hashedPassword,
            role: role || "USER", // Default role to USER if not provided
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        });

        return res.status(201).json({ user: newUser });
      } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ error: "Registration failed" });
      }
    }

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true, // In a real app, you'd compare hashed passwords
        role: true,
      },
    });

    // If user not found or password doesn't match
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // In a real application, you would compare hashed passwords here
    // For example: if (!await bcrypt.compare(password, user.password))
    // In a real application, you would compare hashed passwords here
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // In a real app, you would generate a JWT token here
    // For example: const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Return user data (in a real app, you'd return the token too)
    return res.status(200).json({
      user: userWithoutPassword,
      // token: token, // You would include this in a real app
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ error: "Authentication failed" });
  }
}
