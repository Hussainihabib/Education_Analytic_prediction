import { apiErrorMessage } from "../../utils/validation";
import { useEffect, useState } from "react";

import DataTable from "../../components/DataTable.jsx";
import Modal from "../../components/Modal.jsx";
import { StatusBadge } from "../../components/Badges.jsx";

import {
  getResults,
  createResult,
  updateResult,
  deleteResult,
} from "../../api/resultApi";

const emptyForm = {
  result_id: "",
  student_id: "",
  course_id: "",
  teacher_id: "",
  marks_obtained: "",
  total_marks: 100,
  semester: 1,
  exam_type: "Quiz",
  remarks: "",
};

export default function Results() {

  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modal, setModal] = useState(null);

  const [active, setActive] = useState(null);

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {

    loadResults();

  }, []);


  if (loading) {
  return (
    <div className="text-center py-10">
      Loading Results...
    </div>
  );
}

  async function loadResults() {

    try {

      const res = await getResults();

      setResults(res.results || []);

    } catch (err) {

      setError(apiErrorMessage(err));

    } finally {

      setLoading(false);

    }

  }

  function openAdd() {

    setForm(emptyForm);

    setModal("add");

  }

  function openEdit(row) {

    setActive(row);

    setForm({   
      result_id: row.result_id,

      student_id: row.student_id,

      course_id: row.course_id,

      teacher_id: row.teacher_id,

      marks_obtained: row.marks_obtained,

      total_marks: row.total_marks,

      semester: row.semester,

      exam_type: row.exam_type,

      remarks: row.remarks || "",

    });

    setModal("edit");

  }

  function openDelete(row) {

    setActive(row);

    setModal("delete");

  }

  function closeModal() {

    setModal(null);

    setActive(null);

  }

  async function submit(e) {

    e.preventDefault();

    try {

      if (modal === "add") {

        await createResult(form);

      } else {

        await updateResult(

          active.result_id,

          form

        );

      }

      closeModal();

      loadResults();

    } catch (err) {

      setError(apiErrorMessage(err));

    }

  }

  async function handleDelete() {

    try {

      await deleteResult(active.result_id);

      closeModal();

      loadResults();

    } catch (err) {

      setError(apiErrorMessage(err));

    }

  }
const columns = [
  {
    key: "result_id",
    label: "Result ID",
  },
  {
    key: "student_id",
    label: "Student",
  },
  {
    key: "course_id",
    label: "Course",
  },
  {
    key: "teacher_id",
    label: "Teacher",
  },
  {
    key: "percentage",
    label: "Percentage",
    render: (row) => `${row.percentage}%`,
  },
  {
    key: "grade",
    label: "Grade",
  },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <StatusBadge value={row.status} />
    ),
  },
];

return (
    <div className="space-y-5">
      {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-600 px-3 py-2 text-sm">{error}</div>}
            <div className="flex items-center justify-between">

    <p className="text-sm text-slate-500">
        {results.length} Results Found
    </p>

    <button
        onClick={openAdd}
        className="btn-primary"
    >
        + Add Result
    </button>

    </div>



    
    <DataTable
      columns={columns}
      rows={results}
      rowKey="result_id"
      searchKeys={[
        "result_id",
        "student_id",
        "course_id",
        "teacher_id",
      ]}
      filters={[
        {
          key: "status",
          label: "Status",
          options: ["Pass", "Fail"],
        },
        {
          key: "exam_type",
          label: "Exam",
          options: ["Quiz", "Assignment", "Mid", "Final"],
        },
      ]}
        renderActions={(row) => (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => openEdit(row)}
              className="text-xs font-medium text-navy-900 hover:underline"
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

      <Modal
        open={modal === "add" || modal === "edit"}
        onClose={closeModal}
        title={modal === "add" ? "Add Result" : "Edit Result"}
      >
        <form onSubmit={submit} className="space-y-4">

          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="label">Result ID</label>

              <input
                className="input"
                disabled={modal === "edit"}
                required
                value={form.result_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    result_id: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="label">Student ID</label>

              <input
                className="input"
                required
                value={form.student_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    student_id: e.target.value,
                  })
                }
              />
            </div>

          </div>

          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="label">Course ID</label>

              <input
                className="input"
                required
                value={form.course_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    course_id: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="label">Teacher ID</label>

              <input
                className="input"
                required
                value={form.teacher_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    teacher_id: e.target.value,
                  })
                }
              />
            </div>

          </div>

          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="label">Obtained Marks</label>

              <input
                className="input"
                type="number"
                value={form.marks_obtained}
               onChange={(e) =>
                setForm({
                  ...form,
                  marks_obtained: Number(e.target.value),
                })
              }
              />
            </div>

            <div>
              <label className="label">Total Marks</label>

              <input
                className="input"
                type="number"
                value={form.total_marks}
                onChange={(e) =>
                  setForm({
                    ...form,
                    total_marks: Number(e.target.value),
                  })
                }
              />
            </div>

          </div>

          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="label">Semester</label>

              <input
                className="input"
                type="number"
                min="1"
                max="8"
                value={form.semester}
                onChange={(e) =>
                setForm({
                  ...form,
                  semester: Number(e.target.value),
                })
              }
              />
            </div>

            <div>
              <label className="label">Exam Type</label>

              <select
                className="input"
                value={form.exam_type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    exam_type: e.target.value,
                  })
                }
              >
                <option>Quiz</option>
                <option>Assignment</option>
                <option>Mid</option>
                <option>Final</option>
              </select>
            </div>

          </div>

          <div>

            <label className="label">Remarks</label>

            <textarea
              className="input"
              value={form.remarks}
              onChange={(e) =>
                setForm({
                  ...form,
                  remarks: e.target.value,
                })
              }
            />

          </div>

          <div className="flex gap-3 pt-2">

            <button
              type="button"
              onClick={closeModal}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-primary flex-1"
            >
              {modal === "add"
                ? "Add Result"
                : "Save Changes"}
            </button>

          </div>

        </form>

      </Modal>    

      <Modal
        open={modal === "delete"}
        onClose={closeModal}
        title="Delete Result"
        width="max-w-sm"
      >
        <p className="text-sm text-slate-500 mb-5">
          Delete Result <strong>{active?.result_id}</strong> ?
        </p>

        <div className="flex gap-3">
          <button
            onClick={closeModal}
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
