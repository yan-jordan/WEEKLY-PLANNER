import Task from '../Task/Task'

const Tasks = ({data}) => {
    return(
        <div className="min-h-screen flex flex-col ml-15 mt-5">
            <Task data={data}/>
        </div>
    )
}

export default Tasks;