import Link from 'next/link'


export default function Home() {
  return (
    <div className="text-background min-h-screen flex flex-col justify-center items-center text-6xl">
      <h1 className="font-bold block mb-5">WELCOME TO CHINESH</h1>
      <h3 className="block mb-5 text-primary font-bold">WEEKLY PLANER</h3>
      <Link href="/login" className="bg-primary text-foreground mt-4 p-4 px-20 rounded-2xl hover:bg-foreground'">Start</Link>
    </div>
  );
}
