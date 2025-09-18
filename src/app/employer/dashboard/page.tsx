import { redirect } from 'next/navigation'

export default async function EmployerDashboard() {
  // Redirect to the actual dashboard home page
  redirect('/employer/dashboard/home')
}