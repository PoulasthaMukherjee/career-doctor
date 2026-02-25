import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import NewResumeForm from "@/components/NewResumeForm";

export default async function NewResumePage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    return <NewResumeForm />;
}
