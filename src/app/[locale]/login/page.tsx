import {LoginScreen} from "@/features/auth/components/login-screen";

/**
 * 登录页入参, 读取守卫带来的 redirect 参数
 */
interface LoginPageProps {
    /** 查询参数, redirect 用于记录原始目标路径 */
    searchParams: Promise<{ redirect?: string }>;
}

/**
 * 登录页, 承接认证入口与守卫跳转
 *
 * @param props 页面入参
 * @returns 登录页面
 */
export default async function LoginPage({searchParams}: LoginPageProps) {
    const {redirect} = await searchParams;

    return <LoginScreen redirectTo={redirect}/>;
}
