import { auth } from "@/lib/auth";

export async function GET() {
  const adminEmail = process.env.ADMIN_EMAIL ;
  const adminPassword = process.env.ADMIN_PASSWORD ;
  const adminName = process.env.ADMIN_NAME;

  const userEmail = process.env.DEFAULT_USER_EMAIL ;
  const userPassword = process.env.DEFAULT_USER_PASSWORD ;
  const userName = process.env.DEFAULT_USER_NAME ;

  let adminCreated = false;
  let userCreated = false;

  // Helper function
  const createSafeUser = async (payload: any) => {
    try {
      const res = await auth.api.createUser({
        method: "POST",
        body: payload,
      });
      return { created: true, user: res.user };
    } catch (err: any) {
      if (/exist/i.test(err.message)) return { created: false, exists: true };
      return { created: false, error: err.message };
    }
  };

  const adminRes = await createSafeUser({
    email: adminEmail,
    password: adminPassword,
    name: adminName,
    role: "admin",
    data: {
      image:
        "https://tse4.mm.bing.net/th/id/OIP.5-Bgjm2pNzA2mLrHsB6V3gHaHa?cb=ucfimg2ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3",
    },
  });

  const userRes = await createSafeUser({
    email: userEmail,
    password: userPassword,
    name: userName,
    role: "user",
    data: {
      image:
        // "https://ui-avatars.com/api/?name=Default+User&background=random",
        "https://tse3.mm.bing.net/th/id/OIP.N6HHUrNv4bsSKj5VVZXsMAHaHQ?cb=ucfimg2ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3",
    },
  });

  return Response.json(
    {
      success: true,
      admin: adminRes,
      user: userRes,
      message: "Default users have been processed",
    },
    { status: 200 }
  );
}
