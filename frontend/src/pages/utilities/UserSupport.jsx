import { useEffect, useState } from "react";

import {

  createSupport,

  getMySupport

} from "../../api/api";

import { useData } from "../../context/DataContext.jsx";

const TABS = [

  "Support",

  "Feedback",

  "Bug"

];

export default function UserSupport() {

  const { showToast } = useData();

  const [tab, setTab] = useState("Support");

  const [tickets, setTickets] = useState([]);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({

    subject: "",

    message: "",

    category: "Other",

    priority: "Medium"

  });

  // ==========================================
  // Load My Tickets
  // ==========================================

  const loadTickets = async () => {

    try {

      setLoading(true);

      const data = await getMySupport();

      setTickets(data || []);

    }

    catch (err) {

      console.error(err);

      showToast("Unable to load tickets.");

    }

    finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadTickets();

  }, []);

  // ==========================================
  // Submit
  // ==========================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (form.subject.trim().length < 3) {
        showToast("Subject must be at least 3 characters.");
        return;
    }

    if (form.message.trim().length < 10) {
        showToast("Message must be at least 10 characters.");
        return;
    }
      
    try {

      await createSupport(form);

      showToast("Support request submitted.");

      setForm({

        subject: "",

        message: "",

        category: "Other",

        priority: "Medium"

      });

      loadTickets();

    }
        catch (err) {

        console.log("========== ERROR ==========");

        console.log(JSON.stringify(err.response.data.errors, null, 2));

        console.log(form);

        showToast("Failed to submit.");

        }

  };

  return (

    <div className="space-y-6">

      <div className="card p-6">

        <div className="flex gap-3 mb-6">

          {

            TABS.map((item)=>(

              <button

                key={item}

                onClick={()=>{

                  setTab(item);

                  if(item==="Support"){

                    setForm(f=>({

                      ...f,

                      category:"Other"

                    }));

                  }

                  if(item==="Feedback"){

                    setForm(f=>({

                      ...f,

                      category:"Feedback"

                    }));

                  }

                  if(item==="Bug"){

                    setForm(f=>({

                      ...f,

                      category:"Bug"

                    }));

                  }

                }}

                className={`px-4 py-2 rounded-lg transition

                ${

                  tab===item

                  ?

                  "bg-navy-900 text-white"

                  :

                  "bg-slate-100 dark:bg-navy-700"

                }`}

              >

                {item}

              </button>

            ))

          }

        </div>

                <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <div>

            <label className="label">

              Subject

            </label>

            <input
              className="input"
              required
              value={form.subject}
              onChange={(e)=>

                setForm({

                  ...form,

                  subject:e.target.value

                })

              }
            />

          </div>

          <div className="grid md:grid-cols-2 gap-4">

            <div>

              <label className="label">

                Category

              </label>

              <select

                className="input"

                value={form.category}

                onChange={(e)=>

                  setForm({

                    ...form,

                    category:e.target.value

                  })

                }

              >

                <option value="Attendance">Attendance</option>

                <option value="Result">Result</option>

                <option value="Course">Course</option>

                <option value="Account">Account</option>

                <option value="Dashboard">Dashboard</option>

                <option value="Prediction">Prediction</option>

                <option value="Bug">Bug</option>

                <option value="Feedback">Feedback</option>

                <option value="Other">Other</option>

              </select>

            </div>

            <div>

              <label className="label">

                Priority

              </label>

              <select

                className="input"

                value={form.priority}

                onChange={(e)=>

                  setForm({

                    ...form,

                    priority:e.target.value

                  })

                }

              >

                <option value="Low">Low</option>

                <option value="Medium">Medium</option>

                <option value="High">High</option>

              </select>

            </div>

          </div>

          <div>

            <label className="label">

              Message

            </label>

            <textarea

              rows="6"

              className="input"

              required

              value={form.message}

              onChange={(e)=>

                setForm({

                  ...form,

                  message:e.target.value

                })

              }

            />

          </div>

          <button

            type="submit"

            className="btn-primary"

          >

            Submit

          </button>

        </form>

      </div>

      {/* ========================================== */}

      {/* My Tickets */}

      {/* ========================================== */}

      <div className="card p-6">

        <h2 className="text-xl font-semibold mb-5">

          My Tickets

        </h2>

        {

          loading

          ?

          (

            <div className="text-center py-10 text-slate-400">

              Loading...

            </div>

          )

          :

          tickets.length===0

          ?

          (

            <div className="text-center py-10 text-slate-400">

              No Support Tickets Found

            </div>

          )

          :

          (

            <div className="space-y-4">

              {

                tickets.map((ticket)=>(

                  <div

                    key={ticket.ticket_id}

                    className="border border-slate-200 dark:border-navy-700 rounded-xl p-5"

                  >

                    <div className="flex justify-between gap-4">

                      <div className="flex-1">

                        <div className="flex items-center gap-2 flex-wrap">

                          <h3 className="font-semibold">

                            {ticket.subject}

                          </h3>

                          <span className="px-2 py-1 rounded-full bg-sky-100 text-sky-700 text-xs">

                            {ticket.category}

                          </span>

                          <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs">

                            {ticket.priority}

                          </span>

                        </div>

                        <p className="mt-3 text-slate-500">

                          {ticket.message}

                        </p>

                        <div className="mt-3 text-xs text-slate-400">

                          {

                            new Date(

                              ticket.created_at

                            ).toLocaleString()

                          }

                        </div>

                      </div>

                      <div className="flex flex-col items-end gap-2">

                        <span className={`px-3 py-1 rounded-full text-xs

                        ${

                          ticket.status==="Resolved"

                          ?

                          "bg-green-100 text-green-700"

                          :

                          ticket.status==="Closed"

                          ?

                          "bg-gray-200 text-gray-700"

                          :

                          "bg-yellow-100 text-yellow-700"

                        }`}>

                          {ticket.status}

                        </span>

                                                {
                          ticket.admin_reply && (
                            <div className="mt-4 w-full rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 p-3">

                              <h4 className="font-semibold text-green-700 dark:text-green-400">

                                Admin Reply

                              </h4>

                              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">

                                {ticket.admin_reply}

                              </p>

                            </div>
                          )
                        }

                      </div>

                    </div>

                  </div>

                ))

              }

            </div>

          )

        }

      </div>

    </div>

  );

}