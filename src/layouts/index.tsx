import { Redirect } from "umi";
import MainLayout from "./main";

export default function Layout(props: any) {
    // const isLogin = localStorage.getItem("name") ? true : false;
    return (
        <>
        <MainLayout>{props.children}</MainLayout>
        </>
    )
}