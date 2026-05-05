"use client"
import { useRouter , usePathname , useSearchParams} from "next/navigation"; 
import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";

const Task = ({ data }) => {

    const [active , setActive] = useState("all");

    const router = useRouter();
    const pathName = usePathname();

    const completedTasks = data.filter(task => task.check).length
    const totalTasks = data.filter(task => task).length
    const progress = totalTasks === 0 ? 0 : parseInt((completedTasks / totalTasks) * 100)

    const clickSortHandler = async(sortName) => {
        router.push(`${pathName}?sort=${sortName}`)
        setActive(sortName)
    }

    const addTaskClickHandler = () => {
        router.push(`${pathName}?addModal=true`)
    }

    const checkStatusHandler = async(id , presentStatus) => {
        const changedStatus = !presentStatus;
        try{
            const res = await fetch("http://localhost:3000/api/account" , {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    action: "checkbox_status",
                    id: id,
                    changedStatus: changedStatus
                })
            })

            if(!res.ok){
                console.log("update has failed");
                router.refresh();
            }else{
                router.refresh();
            }
        }
        catch(error){
            console.error(error);
        }
    }

    const deleteTaskHandler = async(id) => {
        try{
            const res = await fetch("http://localhost:3000/api/account" , {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: 
                    JSON.stringify({
                        action: "deleteTask",
                        id: id,
                    })
            })

            if(!res.ok){
                console.log("deleting task has problem")
            }else{
                router.refresh();
            }
        }catch(err){
            console.error("error" , err)
        }
    }

    return(
        <>
        <div className="relative flex flex-row justify-between p-8 pt-0 pb-5 w-full border-b-2 mb-10 border-primary">
        <h1 className="block font-bold text-6xl text-primary">Tasks</h1>
        </div>
        {data?.map((task , index) => {
            return(
            <div key={task.id} className={`font-mono grid grid-cols-[0.5fr_2fr_1fr_1fr_0.5fr_0.5fr] items-center gap-4 rounded-2xl border-2 border-primary ${task.check ? 'hover:border-green-300' : 'hover:border-red-300'} p-8 w-full overflow-hidden mb-5 ${task.check ? 'hover:bg-secondary' : 'hover:bg-red-200'} hover:scale-105 transition-transform cursor-pointer text-lg  font-bold`}>
        <h1 className={`border-r-3 ${task.check ? 'border-green-200' : 'border-red-300' }`}>{index+1}.</h1>
        <h2>{task.task_name}</h2>
        <h2 className="text-center">{task.time_needed}h</h2>
        <h2 className="text-center">{task.complexity}/5</h2>
        <input className="w-6 h-6 justify-self-center accent-secondary cursor-pointer" type="checkbox" checked={task.check} onChange={() => checkStatusHandler(task.id ,task.check)}/>
        <button onClick={() => deleteTaskHandler(task.id)} className="text-red-400 justify-self-center cursor-pointer">
            <FaTrash size={20} />
        </button>
        </div>
            )
        })}

        <div className="flex">
            <button onClick={() => addTaskClickHandler()} className="font-mono w-full bg-secondary rounded-2xl text-foreground p-5  text-4xl font-bold cursor-pointer">
                Add Task +
            </button>
        </div>

            <div className="mt-5 w-full flex rounded-2xl bg-primary  text-background py-6 px-5  text-3xl  cursor-pointer m">
            <div className="flex flex-row justify-between w-full">
                <button onClick={() => clickSortHandler("all")} className={`font-bold border-3 border-accent text-foreground cursor-pointer ${active === "all" ? "bg-accent" : "bg-primary"} p-2 px-10 text-2xl hover:scale(102) rounded-2xl`}>All Tasks</button>


                <button onClick={() => clickSortHandler("completed")} className={`font-bold border-3 border-accent text-foreground cursor-pointer ${active === "completed" ? "bg-accent" : "bg-primary"} p-2 px-10 text-2xl hover:scale(102) rounded-2xl`}>completed Tasks</button>


                <button onClick={() => clickSortHandler("active")} className={`font-bold border-3 border-accent text-foreground cursor-pointer ${active === "active" ? "bg-accent" : "bg-primary"} p-2 px-10 text-2xl hover:scale(102) rounded-2xl`}>Active Tasks</button>


                <button onClick={() => clickSortHandler("hour")} className={`font-bold border-3 border-accent text-foreground cursor-pointer ${active === "hour" ? "bg-accent" : "bg-primary"} p-2 px-10 text-2xl hover:scale(102) rounded-2xl`}>by hour</button>


                <button onClick={() => clickSortHandler("complexity")} className={`font-bold border-3 border-accent text-foreground cursor-pointer ${active === "complexity" ? "bg-accent" : "bg-primary"} p-2 px-10 text-2xl hover:scale(102) rounded-2xl`}>by  complexity</button>
            </div>
        </div>



        <div className="w-full h-10 bg-gray-300 rounded-4xl mt-5 mb-50">
                    <div
                        className="h-10 bg-accent rounded-4xl transition-all duration-300"
                        style={{width:`${progress}%`}}
                    />
                    <div className="text-xl text-background font-bold text-center mt-5">
                        {progress}% Completed
                        <br/>
                    </div>
        </div>
        </>
    )
}

export default Task;