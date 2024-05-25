import { Toaster } from "react-hot-toast";
import { Header } from "~~/components/Header";

export default function Layout({ children }: { children: any }) {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="relative flex flex-col flex-1">{children}</main>
      </div>
      <Toaster
        position="bottom-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Define default options
          className: "",
          duration: 5000,
          // style: {
          //     background: '#363636',
          //     color: '#fff',
          // },
          // Default options for specific types
          // success: {
          //     duration: 3000,
          //     theme: {
          //         primary: 'green',
          //         secondary: 'black',
          //     },
          // },
        }}
      />
    </>
  );
}
