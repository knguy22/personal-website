interface PageHeaderProps {
  children: React.ReactNode;
}

export default function PageHeader({ children }: PageHeaderProps) {
  return <h1 className="text-4xl text-center pb-5 font-medium">{children}</h1>
}