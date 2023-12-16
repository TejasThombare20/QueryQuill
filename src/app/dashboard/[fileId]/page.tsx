import { getServerSession } from "next-auth"
import { authoption } from "@/app/api/auth/[...nextauth]/route"
import { notFound, redirect } from "next/navigation"
import Files from "../../../../models/files"
import PdfRender from "@/components/PdfRender"
import ChatWrapper from "@/components/chat/ChatWrapper"
import { connectToDB } from "../../../../utils/database"

interface PageProps {
    params: {
        fileId: string
    }
}

const page = async ({ params }: PageProps) => {

    const { fileId } = params
    console.log("fileId : ", fileId)
    const session = await getServerSession(authoption)

    const user = session?.user

    if (!user || !user.id) redirect(`/auth-callback?origin=dashboard/${fileId}`)

    connectToDB();

    const file = await Files.find({ _id: fileId, userId: user.id })

    if (!file) notFound()

    return (
        <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
            <div className="mx-auto w-full max-w-[1600px] grow lg:flex xl:px-2  ">
                {/* left side */}
                <div className="flex-1 xl:flex">
                    <div className="px-4 py-6 lg:pl-8 xl:flex-1 xl:pl-6">
                        <PdfRender url={file[0]?.url} />
                    </div>
                </div>

                <div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0  dark:shadow-md dark:shadow-slate-200">
                    <ChatWrapper fileId={file[0]._id} />
                </div>
            </div>
        </div>
    )
}

export default page