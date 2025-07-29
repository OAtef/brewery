// pages/api/users/[id].js
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const id = parseInt(req.query.id);

  // Validate that id is a valid number
  if (isNaN(id)) {
    return res.status(400).json({ error: "Valid user ID is required" });
  }

  if (req.method === "GET") {
    try {
      const user = await prisma.user.findUnique({ 
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          // Exclude password for security
        }
      });
      if (!user) return res.status(404).json({ error: "User not found" });
      return res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "PUT") {
    const { name, email } = req.body;
    try {
      const updated = await prisma.user.update({
        where: { id },
        data: { name, email },
      });
      return res.status(200).json(updated);
    } catch (error) {
      console.error("Error updating user:", error);
      return res
        .status(400)
        .json({ error: "Update failed", details: error.message });
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.user.delete({ where: { id } });
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting user:", error);
      return res
        .status(400)
        .json({ error: "Delete failed", details: error.message });
    }
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
