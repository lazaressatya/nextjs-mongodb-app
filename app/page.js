
"use client";

import { useCallback, useEffect, useState } from "react";

export default function Home() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "Engineering",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadEmployees = useCallback(async () => {
    try {
      const response = await fetch("/api/employees", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);
      setEmployees(data);
    } catch (error) {
      setMessage(error.message || "Unable to load employees");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  async function addEmployee(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setForm({
        name: "",
        email: "",
        department: "Engineering",
      });
      setMessage("Employee added successfully");
      await loadEmployees();
    } catch (error) {
      setMessage(error.message || "Unable to add employee");
    } finally {
      setSaving(false);
    }
  }

  async function deleteEmployee(id) {
    if (!window.confirm("Delete this employee?")) return;

    try {
      const response = await fetch(
        `/api/employees?id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setMessage("Employee deleted successfully");
      await loadEmployees();
    } catch (error) {
      setMessage(error.message || "Unable to delete employee");
    }
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <a className="brand" href="/">NEXUS</a>
        <span className="status"><i /> Employee workspace</span>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">PEOPLE OPERATIONS / OVERVIEW</p>
          <h1>Manage your <span>people.</span></h1>
          <p className="subtitle">
            Your employee directory, connected to MongoDB.
          </p>
        </div>
        <div className="hero-mark">N</div>
      </section>

      {message && (
        <div className="notice" role="status">
          {message}
          <button onClick={() => setMessage("")} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      <section className="stats">
        <article className="stat-card">
          <span>Total employees</span>
          <strong>{employees.length.toString().padStart(2, "0")}</strong>
          <small>Registered in the directory</small>
        </article>
        <article className="stat-card">
          <span>Departments</span>
          <strong>{new Set(employees.map((e) => e.department)).size
            .toString().padStart(2, "0")}</strong>
          <small>Across your organization</small>
        </article>
        <article className="stat-card">
          <span>Database</span>
          <strong className="connected">Live</strong>
          <small>Loaded from the API</small>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">NEW RECORD</p>
              <h2>Add an employee</h2>
            </div>
            <span className="plus">+</span>
          </div>

          <form onSubmit={addEmployee} className="employee-form">
            <label>
              Full name
              <input
                required
                maxLength={100}
                placeholder="e.g. Alex Johnson"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </label>
            <label>
              Work email
              <input
                required
                type="email"
                maxLength={254}
                placeholder="alex@company.com"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </label>
            <label>
              Department
              <select
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
              >
                <option>Engineering</option>
                <option>DevOps</option>
                <option>Design</option>
                <option>Marketing</option>
                <option>Finance</option>
                <option>Human Resources</option>
                <option>Sales</option>
              </select>
            </label>
            <button className="primary-button" disabled={saving}>
              {saving ? "Saving..." : "Add employee →"}
            </button>
          </form>
        </article>

        <article className="panel directory">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">YOUR ORGANIZATION</p>
              <h2>Employee directory</h2>
            </div>
            <span className="count">{employees.length} records</span>
          </div>

          {loading ? (
            <p className="empty">Loading employees...</p>
          ) : employees.length === 0 ? (
            <p className="empty">
              No employees yet. Add your first employee using the form.
            </p>
          ) : (
            <div className="employee-list">
              {employees.map((employee) => (
                <div className="employee-row" key={employee._id}>
                  <div className="avatar">
                    {employee.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="employee-info">
                    <strong>{employee.name}</strong>
                    <span>{employee.email}</span>
                    <small>{employee.department}</small>
                  </div>
                  <button
                    className="delete-button"
                    onClick={() => deleteEmployee(employee._id)}
                    aria-label={`Delete ${employee.name}`}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <footer>
        <span>NEXUS © {new Date().getFullYear()}</span>
        <span>Next.js · MongoDB · AWS</span>
      </footer>
    </main>
  );
}
