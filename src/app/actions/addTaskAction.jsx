const addTaskAction = async(taskName , hours ,complexity) => {
    try{
        const res = await fetch("http://localhost:3000/api/account" , {
        method: "POST",
        headers : {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            action: "addTask",
            taskName: taskName,
            hours: hours,
            complexity: complexity
        })
    }
    )

    if(!res.ok){
        console.log("adding task has failed")
        console.log(res);
    }else{
        console.log("adding task was successful")
    }
    }catch(err){
        console.error("Error" , err)
    }
}   

export default addTaskAction;