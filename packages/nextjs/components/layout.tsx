import { Toaster } from "react-hot-toast";
import { Header } from "~~/components/Header";

export default function Layout({ children }: { children: any }) {
    return (
        <>
            <div className="flex flex-col min-h-screen" >
                <Header />
                <main className="relative flex flex-col flex-1">
                    {children}
                </main>
            </div>
            <Toaster />
        </>
    )
}
