import { useEffect, useState } from "react";

import {
  getAllSupport,
  searchSupport,
  updateSupportStatus,
  replySupport,
  deleteSupport
} from "../../api/api";

import { useData } from "../../context/DataContext.jsx";

export default function AdminSupport() {

  const { showToast } = useData();

  const [loading, setLoading] = useState(true);

  const [tickets, setTickets] = useState([]);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const [priority, setPriority] = useState("");

  const [category, setCategory] = useState("");

  // Reply Modal

  const [selectedTicket, setSelectedTicket] = useState(null);

  const [reply, setReply] = useState("");

  // ==========================================
  // Load Tickets
  // ==========================================

  const loadTickets = async () => {

    try {

      setLoading(true);

      const data = await getAllSupport();

      setTickets(data || []);

    }

    catch (err) {

      console.error(err);

      showToast("Failed to load tickets.");

    }

    finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadTickets();

  }, []);

  // ==========================================
  // Search
  // ==========================================

  const handleSearch = async () => {

    try {

      setLoading(true);

      const data = await searchSupport({

        email: search,

        status,

        priority,

        category

      });

      setTickets(data || []);

    }

    catch (err) {

      console.error(err);

      showToast("Search failed.");

    }

    finally {

      setLoading(false);

    }

  };

  return (

    <div className="space-y-6">

      {/* Search */}

      <div className="card p-6">

        <h2 className="text-xl font-semibold mb-5">

          Support Tickets

        </h2>

        <div className="grid md:grid-cols-4 gap-4">

          <input

            className="input"

            placeholder="Search Email"

            value={search}

            onChange={(e)=>setSearch(e.target.value)}

          />

          <select

            className="input"

            value={status}

            onChange={(e)=>setStatus(e.target.value)}

          >

            <option value="">

              All Status

            </option>

            <option value="Open">

              Open

            </option>

            <option value="In Progress">

              In Progress

            </option>

            <option value="Resolved">

              Resolved

            </option>

            <option value="Closed">

              Closed

            </option>

          </select>

          <select

            className="input"

            value={priority}

            onChange={(e)=>setPriority(e.target.value)}

          >

            <option value="">

              All Priority

            </option>

            <option value="Low">

              Low

            </option>

            <option value="Medium">

              Medium

            </option>

            <option value="High">

              High

            </option>

          </select>

          <select

            className="input"

            value={category}

            onChange={(e)=>setCategory(e.target.value)}

          >

            <option value="">

              All Categories

            </option>

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

        <div className="mt-5 flex gap-3">

          <button

            onClick={handleSearch}

            className="btn-primary"

          >

            Search

          </button>

          <button

            onClick={loadTickets}

            className="btn-secondary"

          >

            Reset

          </button>

        </div>

      </div>


            {/* ========================================== */}
      {/* Tickets */}
      {/* ========================================== */}

      <div className="card p-6">

        {

          loading

          ?

          (

            <div className="text-center py-10 text-slate-400">

              Loading Support Tickets...

            </div>

          )

          :

          tickets.length === 0

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

                    <div className="flex justify-between gap-5">

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

                        <p className="text-slate-500 mt-3">

                          {ticket.message}

                        </p>

                        <div className="mt-4 text-sm text-slate-400 space-y-1">

                          <div>

                            Email :

                            {" "}

                            {ticket.user_email}

                          </div>

                          <div>

                            Status :

                            {" "}

                            {ticket.status}

                          </div>

                          <div>

                            {

                              new Date(

                                ticket.created_at

                              ).toLocaleString()

                            }

                          </div>

                        </div>

                        {

                          ticket.admin_reply &&

                          (

                            <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">

                              <div className="font-medium text-green-700">

                                Admin Reply

                              </div>

                              <div className="text-sm mt-1">

                                {ticket.admin_reply}

                              </div>

                            </div>

                          )

                        }

                      </div>

                      <div className="flex flex-col gap-3 w-56">

                        <select

                          className="input"

                          value={ticket.status}

                          onChange={(e)=>{

                            updateSupportStatus(

                              ticket.ticket_id,

                              {

                                status:e.target.value

                              }

                            )

                            .then(()=>{

                              showToast(

                                "Status Updated"

                              );

                              loadTickets();

                            });

                          }}

                        >

                          <option>

                            Open

                          </option>

                          <option>

                            In Progress

                          </option>

                          <option>

                            Resolved

                          </option>

                          <option>

                            Closed

                          </option>

                        </select>

                        <button

                          onClick={()=>{

                            setSelectedTicket(ticket);

                            setReply(

                              ticket.admin_reply || ""

                            );

                          }}

                          className="btn-primary"

                        >

                          Reply

                        </button>



                        <button

                          onClick={async()=>{

                            if(

                              !window.confirm(

                                "Delete this support ticket?"

                              )

                            ) return;

                            try{

                              await deleteSupport(

                                ticket.ticket_id

                              );

                              showToast(

                                "Ticket Deleted Successfully"

                              );

                              loadTickets();

                            }

                            catch(err){

                              console.error(err);

                              showToast(

                                "Unable to delete ticket."

                              );

                            }

                          }}

                          className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition"

                        >

                          Delete

                        </button>

                      </div>

                    </div>

                  </div>

                ))

              }

            </div>

          )

        }

      </div>

      {/* ========================================== */}
      {/* Reply Modal */}
      {/* ========================================== */}

      {

        selectedTicket && (

          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

            <div className="bg-white dark:bg-navy-900 rounded-xl w-full max-w-lg p-6">

              <h3 className="text-lg font-semibold mb-4">

                Reply to Ticket

              </h3>

              <textarea

                rows="6"

                className="input"

                value={reply}

                onChange={(e)=>setReply(e.target.value)}

              />

              <div className="flex justify-end gap-3 mt-5">

                <button

                  className="btn-secondary"

                  onClick={()=>{

                    setSelectedTicket(null);

                    setReply("");

                  }}

                >

                  Cancel

                </button>

                <button

                  className="btn-primary"

                  onClick={async()=>{

                    try{

                      await replySupport(

                        selectedTicket.ticket_id,

                        {

                          admin_reply:reply

                        }

                      );

                      showToast(

                        "Reply Sent Successfully"

                      );

                      setSelectedTicket(null);

                      setReply("");

                      loadTickets();

                    }

                    catch(err){

                      console.error(err);

                      showToast(

                        "Unable to send reply."

                      );

                    }

                  }}

                >

                  Send Reply

                </button>

              </div>

            </div>

          </div>

        )

      }

    </div>

  );

}
