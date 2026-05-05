import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'

export async function POST(req){
    const body = await req.json();
    const{taskName , hours , complexity} = body;

    console.log("body" , body)

    if(body.action === "addTask"){
        try{
            const addTask = await prisma.task.create({
                data:{
                    check : false,
                    task_name: taskName,
                    time_needed: Number(hours),
                    complexity: Number(complexity)
                }
            })
            return NextResponse.json(
                {
                    message: "task has added successfully",
                    addTask: addTask
                },
                {
                    status: 200
                }
            )
        }catch(err){
            console.error("error" , err)
            return NextResponse.json(
                {
                    message: "adding task to db has failed",
                },
                {
                    status: 500
                }
            )
        }
    }
}

export async function GET(req){

    const url = new URL(req.url);
    const sort = url.searchParams.get("sort");

    if(sort === "active"){
        const res = await prisma.task.findMany({
            where: { check: false }
        })
        return NextResponse.json(res)
    }

    if(sort === "completed"){
        const res = await prisma.task.findMany({
            where: { check: true }
        })
        return NextResponse.json(res)
    }

    if(sort === "hour"){
        const res = await prisma.task.findMany({
            orderBy: { time_needed: "asc" }
        })
        return NextResponse.json(res)
    }

    if(sort === "complexity"){
        const res = await prisma.task.findMany({
            orderBy: { complexity: "desc" }
        })
        return NextResponse.json(res)
    }

    const res = await prisma.task.findMany()
    return NextResponse.json(res)
}


export async function PATCH(req){
    const body = await req.json();

    if(body.action === "checkbox_status"){
        const {id ,changedStatus} = body;

    try{
        const updatedTask = await prisma.task.update({
            where: {
                id: id
            },
            data: {
                check: changedStatus
            }
        }) 

        return NextResponse.json(
            {
                message: "updated successfully",
                task: updatedTask
            },
            {
                status: 200
            })

    }catch(err){
        return NextResponse.json(
            {
                message: "ERROR updating task"
            },
            {
                status: 500
            } 
        )
    }
    }
}

export async function DELETE(req){
    const body = await req.json()
    const id = body.id

    if(body.action === "deleteTask"){
        try{
            const deleteTask = await prisma.task.delete({
                where: {
                    id: id
                }
            })

            return NextResponse.json(
                {
                    message: "delete task successfully",
                    task: deleteTask
                },
                {
                    status:200
                }
            )

        }catch(err){
            return NextResponse.json(
                {
                    message:"ERROR deleting task"
                } ,
                {
                    status: 500
                }
            )
        }
    }
}