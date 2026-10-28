
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

async function getCollection() {
  const client = await clientPromise;
  return client.db("employee_db").collection("employees");
}

// GET /api/employees
export async function GET() {
  try {
    const employees = await getCollection();
    const results = await employees
      .find({})
      .sort({ createdAt: -1 })
      .limit(500)
      .toArray();

    return NextResponse.json(
      results.map((employee) => ({
        ...employee,
        _id: employee._id.toString(),
      }))
    );
  } catch (error) {
    console.error("GET employees failed:", error);
    return NextResponse.json(
      { error: "Unable to load employees" },
      { status: 500 }
    );
  }
}

// POST /api/employees
export async function POST(request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string"
      ? body.email.trim().toLowerCase()
      : "";
    const department = typeof body.department === "string"
      ? body.department.trim()
      : "";

    if (!name || !email || !department) {
      return NextResponse.json(
        { error: "Name, email and department are required" },
        { status: 400 }
      );
    }

    if (
      name.length > 100 ||
      email.length > 254 ||
      department.length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { error: "Please provide valid employee details" },
        { status: 400 }
      );
    }

    const employees = await getCollection();
    const result = await employees.insertOne({
      name,
      email,
      department,
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        message: "Employee created",
        _id: result.insertedId.toString(),
        name,
        email,
        department,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error?.code === 11000) {
      return NextResponse.json(
        { error: "An employee with this email already exists" },
        { status: 409 }
      );
    }

    console.error("POST employee failed:", error);
    return NextResponse.json(
      { error: "Unable to create employee" },
      { status: 500 }
    );
  }
}

// DELETE /api/employees?id=<employee-id>
export async function DELETE(request) {
  try {
    const id = new URL(request.url).searchParams.get("id");

    if (!id || !/^[a-f\d]{24}$/i.test(id)) {
      return NextResponse.json(
        { error: "A valid employee ID is required" },
        { status: 400 }
      );
    }

    const employees = await getCollection();
    const result = await employees.deleteOne({
      _id: new ObjectId(id),
    });

    if (!result.deletedCount) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Employee deleted" });
  } catch (error) {
    console.error("DELETE employee failed:", error);
    return NextResponse.json(
      { error: "Unable to delete employee" },
      { status: 500 }
    );
  }
}
