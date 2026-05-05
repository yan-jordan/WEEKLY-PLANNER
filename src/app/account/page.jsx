import Link from 'next/link'
import Tasks from '../components/Tasks/Tasks'
import Modal from '../components/Modal/Modal'

const AccountPage = async({searchParams}) => {
    let db_backend = [];

    const params = await searchParams
    const sort = params.sort || "all"

        try{
            const res = await fetch(`http://localhost:3000/api/account?sort=${sort}`, {
                cache: "no-store"
            })
        if(res.ok){
            db_backend = await res.json();
        }
        }catch(err){
            console.error(err)
        }

    return(
        <div className="flex flex-row min-h-screen relative">

            <div className="flex flex-col bg-primary h-screen w-64 justify-around items-center sticky top-0">
                <Link className='text-xl font-bold text-foreground' href="/">Home</Link>
                <Link className=' text-xl font-bold text-foreground' href="/account">Personal account</Link>
                <Link className=' text-xl font-bold text-foreground' href="/">Subscription</Link>
                <Link className=' text-xl font-bold text-foreground' href="/about">About Us</Link>
                <Link className=' text-xl font-bold text-foreground' href="/login">Login</Link>
            </div>
            
            <div className='w-full pr-15'>
                <Tasks data={db_backend}/>
            </div>

            <Modal />
        </div>
    )
}

export default AccountPage;