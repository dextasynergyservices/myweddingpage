import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import cloudinary from "@/lib/cloudinary";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log("Deleting guest with ID:", params.id);
    const user = await getCurrentUser();
    if (!user) {
      console.log("No user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify guest exists and belongs to user
    const guest = await prisma.guest.findUnique({
      where: { id: params.id },
    });

    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    if (guest.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete from Cloudinary if image exists
    if (guest.invitationCard) {
      try {
        const publicId = guest.invitationCard.split("/").pop()?.split(".")[0];
        if (publicId) {
          const result = await cloudinary.uploader.destroy(publicId);
          console.log("Cloudinary deletion result:", result); // Add this
          if (result.result !== "ok") {
            console.warn("Cloudinary deletion may have failed:", result);
          }
        }
      } catch (cloudinaryError) {
        console.error("Cloudinary error:", cloudinaryError);
        // Continue with deletion even if image deletion fails
      }
    }

    await prisma.guest.delete({
      where: {
        id: params.id,
        userId: user.id, // Ensure user can only delete their own guests
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[GUEST_DELETE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
