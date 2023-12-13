
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import Dashboard from "@/components/Dashboard"
import User from "../../../models/user"
import { connectToDB } from "../../../utils/database"
import { authoption } from '../api/auth/[...nextauth]/route'


const page = async () => {


  const session = await getServerSession(authoption)

  const user: any = session?.user

  if (!user || !user?.email) redirect('/auth-callback?origin=dashboard')

  connectToDB();
  const dbUser = await User.findOne({ email: user.email })

  if (!dbUser) redirect('/auth-callback?origin=dashboard')

  return <Dashboard />
}

export default page
