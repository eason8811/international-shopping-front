import {redirect} from "next/navigation";

/**
 * `/me` 入口页, 统一跳转到账号与地址工作台
 */
export default function MeIndexPage() {
    redirect("/me/account");
}
