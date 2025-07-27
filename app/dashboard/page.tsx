import { FormCard } from "@/components/ui/FormCard"
import { SquarePlus } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <FormCard title="Welcome To Nexttask" subtitle="Manage your task here">
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <CardActionNavigation
          title="Create Tasks"
          subtitle="Create & Manage your task"
          background="from-sky-400 to-blue-600"
          href="/dashboard/tasks/create"
        />
        <CardActionNavigation
          title="Create Category"
          subtitle="Group & Tidy your task"
          background="from-green-400 to-emerald-600"
          titleColor="group-hover:text-green-900"
          subtitleColor="group-hover:text-green-700"
          href="/dashboard/categories/create"
        />
        <CardActionNavigation
          title="View All Tasks"
          subtitle="Check your existing tasks."
          background="from-orange-300 to-amber-600"
          titleColor="group-hover:text-orange-900"
          subtitleColor="group-hover:text-orange-700"
          href="/dashboard/tasks"
        />
        <CardActionNavigation
          title="View Categories"
          subtitle="Manage & review your categories."
          background="from-purple-400 to-indigo-600"
          titleColor="group-hover:text-purple-900"
          subtitleColor="group-hover:text-purple-700"
          href="/dashboard/categories"
        />
      </div>
    </FormCard>
  )
}

type CardProps = {
  title: string
  titleColor?: string
  subtitle: string
  subtitleColor?: string
  background?: string
  href: string
}

export function CardActionNavigation({ title, titleColor, subtitle, subtitleColor, background, href }: CardProps) {
  return (
    <Link href={href} className="group flex items-center space-x-1 md:space-x-2 p-3 md:p-4 border border-gray-200 shadow-sm rounded-md hover:border-gray-300 w-full min-h-[64px]">
      <div className={`bg-gradient-to-tr ${background ?? 'from-sky-400 to-blue-600'} p-2 md:p-3 rounded-md text-white`}>
        <SquarePlus className="w-5 h-5" />
      </div>
      <div>
        <h2 className={`text-sm md:text-md text-gray-800 font-semibold ${titleColor ?? 'group-hover:text-sky-900'}`}>{title}</h2>
        <p className={`text-xs text-gray-500 ${subtitleColor ?? 'group-hover:text-sky-700'}`}>{subtitle}</p>
      </div>
    </Link>
  )
}
