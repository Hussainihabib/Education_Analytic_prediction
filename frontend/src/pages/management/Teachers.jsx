// import { useState } from 'react'
// import DataTable from '../../components/DataTable.jsx'
// import Modal from '../../components/Modal.jsx'
// import { StatusBadge } from '../../components/Badges.jsx'
// import { useData } from '../../context/DataContext.jsx'
// import { departments } from '../../data/mockData.js'

// const emptyForm = { name: '', email: '', dept: 'CS', courses: 1, students: 40 }

// export default function Teachers() {
//   const { teachers, addTeacher, updateTeacher, deleteTeacher } = useData()
//   const [modal, setModal] = useState(null)
//   const [active, setActive] = useState(null)
//   const [form, setForm] = useState(emptyForm)

//   const openAdd = () => { setForm(emptyForm); setModal('add') }
//   const openEdit = (row) => { setActive(row); setForm(row); setModal('edit') }
//   const openDelete = (row) => { setActive(row); setModal('delete') }
//   const close = () => { setModal(null); setActive(null) }

//   const submit = (e) => {
//     e.preventDefault()
//     const payload = { ...form, courses: Number(form.courses), students: Number(form.students) }
//     if (modal === 'add') addTeacher(payload)
//     if (modal === 'edit') updateTeacher(active.id, payload)
//     close()
//   }

//   const columns = [
//     { key: 'id', label: 'ID' },
//     { key: 'name', label: 'Name' },
//     { key: 'dept', label: 'Dept' },
//     { key: 'courses', label: 'Courses' },
//     { key: 'students', label: 'Students' },
//     { key: 'rating', label: 'Rating', render: (r) => `★ ${r.rating}` },
//     { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} /> },
//   ]

//   return (
//     <div className="space-y-5">
//       <div className="flex items-center justify-between">
//         <p className="text-sm text-slate-500">{teachers.length} teachers on record.</p>
//         <button onClick={openAdd} className="btn-primary">+ Add Teacher</button>
//       </div>

//       <DataTable
//         columns={columns}
//         rows={teachers}
//         searchKeys={['name', 'email', 'id']}
//         filters={[
//           { key: 'dept', label: 'Dept', options: departments.map((d) => d.id) },
//           { key: 'status', label: 'Status', options: ['active', 'on leave'] },
//         ]}
//         renderActions={(row) => (
//           <div className="flex justify-end gap-2">
//             <button onClick={() => openEdit(row)} className="text-xs font-medium text-navy-900 dark:text-cream-100 hover:underline">Edit</button>
//             <button onClick={() => openDelete(row)} className="text-xs font-medium text-red-500 hover:underline">Delete</button>
//           </div>
//         )}
//       />

//       <Modal open={modal === 'add' || modal === 'edit'} onClose={close} title={modal === 'add' ? 'Add Teacher' : 'Edit Teacher'}>
//         <form onSubmit={submit} className="space-y-4">
//           <div>
//             <label className="label">Full name</label>
//             <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
//           </div>
//           <div>
//             <label className="label">Email</label>
//             <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
//           </div>
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="label">Department</label>
//               <select className="input" value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })}>
//                 {departments.map((d) => <option key={d.id} value={d.id}>{d.id}</option>)}
//               </select>
//             </div>
//             <div>
//               <label className="label">Courses assigned</label>
//               <input className="input" type="number" min="0" required value={form.courses} onChange={(e) => setForm({ ...form, courses: e.target.value })} />
//             </div>
//           </div>
//           <div className="flex gap-3 pt-2">
//             <button type="button" onClick={close} className="btn-secondary flex-1">Cancel</button>
//             <button type="submit" className="btn-primary flex-1">{modal === 'add' ? 'Add Teacher' : 'Save Changes'}</button>
//           </div>
//         </form>
//       </Modal>

//       <Modal open={modal === 'delete'} onClose={close} title="Delete Teacher" width="max-w-sm">
//         <p className="text-sm text-slate-500 mb-5">Remove <strong>{active?.name}</strong> from teacher records?</p>
//         <div className="flex gap-3">
//           <button onClick={close} className="btn-secondary flex-1">Cancel</button>
//           <button onClick={() => { deleteTeacher(active.id); close() }} className="btn-danger flex-1">Delete</button>
//         </div>
//       </Modal>
//     </div>
//   )
// }






import { apiErrorMessage } from "../../utils/validation";

import { useState, useEffect } from "react";
import DataTable from "../../components/DataTable.jsx";
import Modal from "../../components/Modal.jsx";
import { StatusBadge } from "../../components/Badges.jsx";

import {
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../../api/teacherApi";

const emptyForm = {
  teacher_id: "",
  first_name: "",
  last_name: "",
  email: "",
  gender: "Male",
  age: 25,
  department: "",
  designation: "",
  qualification: "",
  experience: 0,
  phone: "",
  address: "",
  status: "Active",
};

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modal, setModal] = useState(null);
  const [active, setActive] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  useEffect(() => {
    loadTeachers();
  }, []);

  async function loadTeachers() {
    try {
      setError("");

      const res = await getTeachers();

      setTeachers(res?.teachers || []);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-10">
        Loading Teachers...
      </div>
    );
  }

  const openAdd = () => {
    setError("");
    setActive(null);
    setForm({ ...emptyForm });
    setModal("add");
  };

  const openEdit = (row) => {
    setError("");
    setActive(row);

    setForm({
      teacher_id: row.teacher_id || "",
      first_name: row.first_name || "",
      last_name: row.last_name || "",
      email: row.email || "",
      gender: row.gender || "Male",
      age: row.age ?? 25,
      department: row.department || "",
      designation: row.designation || "",
      qualification: row.qualification || "",
      experience: row.experience ?? 0,
      phone: row.phone || "",
      address: row.address || "",
      status: row.status || "Active",
    });

    setModal("edit");
  };

  const openDelete = (row) => {
    setError("");
    setActive(row);
    setModal("delete");
  };

  const close = () => {
    setModal(null);
    setActive(null);
    setForm({ ...emptyForm });
  };

  const handleChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      if (modal === "add") {
        await createTeacher(form);
      }

      if (modal === "edit") {
        await updateTeacher(
          active.teacher_id,
          form
        );
      }

      await loadTeachers();
      close();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!active?.teacher_id) return;

    try {
      setError("");

      await deleteTeacher(active.teacher_id);

      await loadTeachers();

      close();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const columns = [
    {
      key: "teacher_id",
      label: "Teacher ID",
    },

    {
      key: "first_name",
      label: "First Name",
    },

    {
      key: "last_name",
      label: "Last Name",
    },

    {
      key: "department",
      label: "Department",
    },

    {
      key: "designation",
      label: "Designation",
    },

    {
      key: "experience",
      label: "Experience",
      render: (row) =>
        `${row.experience ?? 0} Years`,
    },

    {
      key: "status",
      label: "Status",
      render: (row) => (
        <StatusBadge
          value={(row.status || "Active").toLowerCase()}
        />
      ),
    },
  ];

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-slate-500">
            {teachers.length} teachers on record.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="btn-primary"
        >
          + Add Teacher
        </button>

      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={columns}
        rows={teachers}
        searchKeys={[
          "teacher_id",
          "first_name",
          "last_name",
          "email",
          "department",
          "designation",
        ]}
        filters={[]}
        renderActions={(row) => (
          <div className="flex justify-end gap-2">

            <button
              onClick={() => openEdit(row)}
              className="text-xs font-medium text-navy-900 dark:text-cream-100 hover:underline"
            >
              Edit
            </button>

            <button
              onClick={() => openDelete(row)}
              className="text-xs font-medium text-red-500 hover:underline"
            >
              Delete
            </button>

          </div>
        )}
      />

      {/* Add / Edit */}
      <Modal
        open={
          modal === "add" ||
          modal === "edit"
        }
        onClose={close}
        title={
          modal === "add"
            ? "Add Teacher"
            : "Edit Teacher"
        }
      >
        <form
          onSubmit={submit}
          className="space-y-4"
        >

          {/* ID / First Name */}
          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="label">
                Teacher ID
              </label>

              <input
                className="input"
                required
                disabled={modal === "edit"}
                value={form.teacher_id}
                pattern="[A-Za-z0-9_-]{3,20}"
                minLength={3}
                maxLength={20}
                onChange={(e) =>
                  handleChange(
                    "teacher_id",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label className="label">
                First Name
              </label>

              <input
                className="input"
                required
                minLength={2}
                maxLength={50}
                pattern="[A-Za-z]+(?: [A-Za-z]+)*"
                value={form.first_name}
                onChange={(e) =>
                  handleChange(
                    "first_name",
                    e.target.value
                  )
                }
              />
            </div>

          </div>

          {/* Last Name */}
          <div>
            <label className="label">
              Last Name
            </label>

            <input
              className="input"
              required
              minLength={2}
              maxLength={50}
              pattern="[A-Za-z]+(?: [A-Za-z]+)*"
              value={form.last_name}
              onChange={(e) =>
                handleChange(
                  "last_name",
                  e.target.value
                )
              }
            />
          </div>

          {/* Email */}
          <div>
            <label className="label">
              Email
            </label>

            <input
              className="input"
              type="email"
              required
              value={form.email}
              onChange={(e) =>
                handleChange(
                  "email",
                  e.target.value
                )
              }
            />
          </div>

          {/* Gender / Age */}
          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="label">
                Gender
              </label>

              <select
                className="input"
                value={form.gender}
                onChange={(e) =>
                  handleChange(
                    "gender",
                    e.target.value
                  )
                }
              >
                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            <div>
              <label className="label">
                Age
              </label>

              <input
                className="input"
                type="number"
                required
                min="22"
                max="70"
                value={form.age}
                onChange={(e) =>
                  handleChange(
                    "age",
                    Number(e.target.value)
                  )
                }
              />
            </div>

          </div>

          {/* Department / Designation */}
          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="label">
                Department
              </label>

              <input
                className="input"
                required
                minLength={2}
                maxLength={100}
                value={form.department}
                onChange={(e) =>
                  handleChange(
                    "department",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label className="label">
                Designation
              </label>

              <input
                className="input"
                required
                minLength={2}
                maxLength={100}
                value={form.designation}
                onChange={(e) =>
                  handleChange(
                    "designation",
                    e.target.value
                  )
                }
              />
            </div>

          </div>

          {/* Qualification / Experience */}
          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="label">
                Qualification
              </label>

              <input
                className="input"
                required
                minLength={2}
                maxLength={150}
                value={form.qualification}
                onChange={(e) =>
                  handleChange(
                    "qualification",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label className="label">
                Experience
              </label>

              <input
                className="input"
                type="number"
                required
                min="0"
                max="50"
                value={form.experience}
                onChange={(e) =>
                  handleChange(
                    "experience",
                    Number(e.target.value)
                  )
                }
              />
            </div>

          </div>

          {/* Phone */}
          <div>
            <label className="label">
              Phone
            </label>

            <input
              className="input"
              required
              pattern="03\d{9}"
              maxLength={11}
              minLength={11}
              value={form.phone}
              onChange={(e) =>
                handleChange(
                  "phone",
                  e.target.value
                )
              }
            />
          </div>

          {/* Address */}
          <div>
            <label className="label">
              Address
            </label>

            <textarea
              className="input"
              required
              rows={3}
              minLength={3}
              maxLength={250}
              value={form.address}
              onChange={(e) =>
                handleChange(
                  "address",
                  e.target.value
                )
              }
            />
          </div>

          {/* Status */}
          <div>
            <label className="label">
              Status
            </label>

            <select
              className="input"
              value={form.status}
              onChange={(e) =>
                handleChange(
                  "status",
                  e.target.value
                )
              }
            >
              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">

            <button
              type="button"
              onClick={close}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-primary flex-1"
            >
              {modal === "add"
                ? "Add Teacher"
                : "Save Changes"}
            </button>

          </div>

        </form>
      </Modal>

      {/* Delete */}
      <Modal
        open={modal === "delete"}
        onClose={close}
        title="Delete Teacher"
        width="max-w-sm"
      >
        <p className="text-sm text-slate-500 mb-5">
          Remove{" "}
          <strong>
            {active?.first_name}{" "}
            {active?.last_name}
          </strong>{" "}
          from teacher records?

          <br />

          This action cannot be undone.
        </p>

        <div className="flex gap-3">

          <button
            onClick={close}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            className="btn-danger flex-1"
          >
            Delete
          </button>

        </div>
      </Modal>

    </div>
  );
}
