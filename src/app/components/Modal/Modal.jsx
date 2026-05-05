"use client"
import { useSearchParams , useRouter ,usePathname } from "next/navigation"
import { useState } from "react";
import { HiXMark } from "react-icons/hi2"
import addTaskAction from "../../actions/addTaskAction"

const Modal = () => {
    const pathName = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [step , setStep] = useState(0);
    const [taskName , setTaskName] = useState("");
    const [hours , setHours] = useState(0);
    const [complexity , setComplexity] = useState(0);

    const totalSteps = 3;

    const next = () => {
        setStep(step+1)
    }
    const back = () => {
        setStep(step-1)
    }

    const  submit = async() => {
        await addTaskAction(taskName , hours ,complexity);

        closeModal();
        setStep(0);
        setTaskName("");
        setHours(0);
        setComplexity(0);
    }

    const progress = (step / totalSteps) * 100;


    let addModal = searchParams.get("addModal");

    const closeModal = () => {
        router.push(pathName);
    }

    if(!addModal) return null;

    return(
        <div className="fixed flex w-screen h-screen backdrop-blur-lg z-50">
            <div className="bg-primary m-auto w-[50vw] h-[80vh] rounded-3xl p-10 pt-5 flex flex-col">

                <button className="flex justify-between mb-2 font-bold text-5xl text-foreground cursor-pointer mt-5 ml-auto" onClick={closeModal}>
                <HiXMark size={35} />
                </button>

                {/* slider container */}
            <div className="flex-1 overflow-hidden">

        <div
        className="flex h-full transition-transform duration-400 ease-in-out"
        style={{ transform: `translateX(-${step * 100}%)` }}>

    {/* step 1 */}
        <div className="min-w-full flex flex-shrink-0  flex-col justify-center gap-4">

            <h2 className="bg-foreground rounded-2xl p-6 text-4xl text-center font-bold text-background">Enter Your Task name</h2>

            <input
            className="border-4  border-foreground p-2 rounded text-2xl mt-15 accent-foreground"
            value={taskName}
            onChange={(e)=>setTaskName(e.target.value)}/>

            <button className=" mt-5 mb-20 bg-foreground py-3 px-15  font-bold rounded-xl cursor-pointer" onClick={next}>Next</button>

        </div>

    {/* step 2 */}
        <div className="min-w-full flex-shrink-0 flex flex-col justify-center gap-4">

            <h2 className="bg-foreground rounded-2xl p-6 text-4xl text-center font-bold text-background">How many hours?</h2>

            <input
            type="range"
            min="1"
            max="10"
            className="accent-foreground border-0 border-b-2 border-foreground p-2  text-2xl mt-15"
            value={hours}
            onChange={(e)=>setHours(e.target.value)}/>

            <p className="text-4xl text-center font-bold text-foreground">{hours}h</p>


            <div className="flex gap-4">
                <button className="mt-5 mb-20 bg-foreground py-3 px-15  font-bold rounded-xl cursor-pointer" onClick={back}>Back</button>
                <button className="mt-5 mb-20 bg-foreground py-3 px-15  font-bold rounded-xl cursor-pointer ml-auto" onClick={next}>Next</button>
            </div>

        </div>

    {/* step 3 */}
        <div className="min-w-full flex-shrink-0 flex flex-col justify-center gap-4">

            <h2 className="bg-foreground rounded-2xl p-6 text-4xl text-center font-bold text-background">Complexity</h2>

            <input
            type="range"
            min="1"
            max="5"
            value={complexity}
            className="p-2  mt-15 accent-foreground"
            onChange={(e)=>setComplexity(e.target.value)}/>

            <p className="text-4xl text-center font-bold text-foreground">{complexity}/5</p>

            <div className="flex gap-4">
                <button className="mt-5 mb-20 bg-foreground py-3 px-15  font-bold rounded-xl cursor-pointer" onClick={back}>Back</button>
                <button className="mt-5 mb-20 bg-foreground py-3 px-15  font-bold rounded-xl cursor-pointer ml-auto" onClick={next}>Next</button>
            </div>

        </div>

    {/* step 4 */}
        <div className="min-w-full flex-shrink-0 flex flex-col justify-center gap-4">

            <h2 className="bg-foreground rounded-2xl p-6 text-4xl text-center font-bold text-background">Confirm</h2>

            <p className="text-3xl  text-center  text-background">Task: {taskName}</p>
            <p className="text-3xl  text-center  text-background">Hours: {hours}</p>
            <p className="text-3xl  text-center  text-background mb-15">Complexity: {complexity}</p>

            <div className="flex gap-4">
                <button className="mt-5 mb-20 bg-foreground py-3 px-15  font-bold rounded-xl cursor-pointer" onClick={back}>Back</button>
                <button className="mt-5 mb-20 bg-foreground py-3 px-15  font-bold rounded-xl cursor-pointer ml-auto" onClick={submit}>Done</button>
            </div>

        </div>

        </div>

</div>

                {/* footer */}
                <div className="mb-6 flex flex-col items-center">

                    <div className="flex justify-between mb-2 font-bold text-xl text-foreground">
                        <span>Step {step+1} / {totalSteps+1}</span>
                    </div>

                    <div className="w-full h-3 bg-gray-300 rounded">
                        <div
                            className="h-3 bg-accent rounded transition-all duration-300"
                            style={{width:`${progress}%`}}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Modal;