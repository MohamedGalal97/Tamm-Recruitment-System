const API_URL = "http://localhost:3000";

// Navigate Function
const navigate = (page) => {
  window.location.href = page;
};

// Authentication Guards

const requireUser = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser) {
    navigate("login.html");
    return null;
  }

  return currentUser;
};

const requireAdmin = () => {
  const currentAdmin = JSON.parse(localStorage.getItem("currentAdmin"));

  if (!currentAdmin) {
    navigate("admin-login.html");
    return null;
  }

  return currentAdmin;
};

// Sign Up
const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const companyName = document.getElementById("companyName").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(password)) {
      alert(
        "Password must contain uppercase, lowercase, number, special character and 8 characters minimum",
      );
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users`);
      const users = await response.json();

      const existingUser = users.find(
        (user) => user.email.toLowerCase() === email,
      );

      if (existingUser) {
        alert("Email already exists!");
        return;
      }

      const newUser = { companyName, email, password };

      const postResponse = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!postResponse.ok) {
        throw new Error("Signup failed");
      }

      alert("Account created successfully!");
      navigate("login.html");
    } catch (error) {
      alert("Server error!");
    }
  });
}

// Login
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    try {
      const response = await fetch(`${API_URL}/users`);
      const users = await response.json();

      const user = users.find(
        (user) =>
          user.email.toLowerCase() === email && user.password === password,
      );

      if (!user) {
        alert("Invalid email or password!");
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(user));
      alert("Login successful!");
      navigate("dashboard.html");
    } catch (error) {
      alert("Server error!");
    }
  });
}

// Admin Login
const adminLoginForm = document.getElementById("adminLoginForm");

if (adminLoginForm) {
  adminLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("adminEmail").value.trim();
    const password = document.getElementById("adminPassword").value;

    try {
      const response = await fetch(`${API_URL}/admins`);
      const admins = await response.json();

      const admin = admins.find(
        (admin) => admin.email === email && admin.password === password,
      );

      if (!admin) {
        alert("Invalid admin credentials!");
        return;
      }

      localStorage.setItem("currentAdmin", JSON.stringify(admin));
      alert("Admin login successful!");
      navigate("admin-dashboard.html");
    } catch (error) {
      alert("Server error!");
    }
  });
}

// Forgot Password
const forgotForm = document.getElementById("forgotForm");

if (forgotForm) {
  forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();

    try {
      const response = await fetch(`${API_URL}/users`);
      const users = await response.json();

      const user = users.find((user) => user.email === email);

      if (!user) {
        alert("Email not found!");
        return;
      }

      alert("Reset link sent!");
      navigate("login.html");
    } catch (error) {
      alert("Server error!");
    }
  });
}

// Logout
document.querySelectorAll(".logout-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentAdmin");
    localStorage.removeItem("selectedJob");
    navigate(link.getAttribute("href"));
  });
});

// Load Dashboard
const welcomeMessage = document.getElementById("welcomeMessage");

if (welcomeMessage) {
  const currentUser = requireUser();

  if (currentUser) {
    document.getElementById("companyName").textContent =
      currentUser.companyName;
    welcomeMessage.textContent = `Welcome back, ${currentUser.companyName}`;

    const loadStats = async () => {
      try {
        const jobsResponse = await fetch(`${API_URL}/jobs`);
        const jobs = await jobsResponse.json();

        const userJobs = jobs.filter((job) => job.email === currentUser.email);
        const openJobs = userJobs.filter((job) => job.status !== "Closed");
        const closedJobs = userJobs.filter((job) => job.status === "Closed");

        document.getElementById("openJobsCount").textContent = openJobs.length;
        document.getElementById("closedJobsCount").textContent =
          closedJobs.length;

        const candidatesResponse = await fetch(`${API_URL}/candidates`);
        const candidates = await candidatesResponse.json();

        const userJobIds = userJobs.map((job) => job.id);
        const newCandidates = candidates.filter((candidate) =>
          userJobIds.includes(candidate.jobId),
        );

        document.getElementById("candidatesCount").textContent =
          newCandidates.length;
      } catch (error) {
        alert("Server error!");
      }
    };

    loadStats();
  }
}

// Create Job Request
const jobRequestForm = document.getElementById("jobRequestForm");

if (jobRequestForm) {
  const currentUser = requireUser();

  if (currentUser) {
    document.getElementById("companyName").value = currentUser.companyName;

    jobRequestForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const newJob = {
        companyName: currentUser.companyName,
        email: currentUser.email,
        department: document.getElementById("department").value,
        employmentType: document.getElementById("employmentType").value,
        workType: document.getElementById("workType").value,
        experience: document.getElementById("experience").value,
        title: document.getElementById("jobTitle").value,
        location: document.getElementById("location").value,
        salary: document.getElementById("salary").value,
        description: document.getElementById("jobDescription").value,
        requirements: document.getElementById("requirements").value,
        status: "Pending",
      };

      try {
        const response = await fetch(`${API_URL}/jobs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newJob),
        });

        if (!response.ok) {
          throw new Error();
        }

        alert("Job request submitted successfully!");
        jobRequestForm.reset();
        document.getElementById("companyName").value = currentUser.companyName;
        navigate("my-jobs.html");
      } catch (error) {
        alert("Unable to submit job request");
      }
    });
  }
}

// Load My Jobs
const jobsContainer = document.getElementById("jobsContainer");

if (jobsContainer) {
  const currentUser = requireUser();

  const loadJobs = async () => {
    try {
      const response = await fetch(`${API_URL}/jobs`);
      const jobs = await response.json();

      const userJobs = jobs.filter((job) => job.email === currentUser.email);

      document.getElementById("jobsCount").textContent =
        `${userJobs.length} Job Requests`;

      jobsContainer.innerHTML = "";

      userJobs.forEach((job) => {
        const card = document.createElement("article");
        card.classList.add("request-card");

        const closeBtnHtml =
          job.status === "Closed"
            ? `<button class="close-request-btn" disabled>Closed</button>`
            : `<button class="close-request-btn">Close Request</button>`;

        card.innerHTML = `
            <div class="request-info">
              <h2>${job.title}</h2>
              <p>Status: ${job.status}</p>
              <p>Company: ${job.companyName}</p>
              <p>Department: ${job.department}</p>
              <p>Employment Type: ${job.employmentType}</p>
              <p>Work Type: ${job.workType}</p>
              <p>Location: ${job.location}</p>
              <p>Experience: ${job.experience}</p>
              <p>Salary: ${job.salary}</p>
              <p>Description: ${job.description}</p>
              <p>Requirements: ${job.requirements}</p>
            </div>
            <div class="card-actions">
              <button class="view-candidates-btn">View Candidates</button>
              ${closeBtnHtml}
            </div>
          `;

        jobsContainer.appendChild(card);

        card
          .querySelector(".view-candidates-btn")
          .addEventListener("click", () => {
            localStorage.setItem("selectedJob", JSON.stringify(job));
            navigate("review-candidates.html");
          });

        const closeRequestBtn = card.querySelector(".close-request-btn");

        if (job.status !== "Closed") {
          closeRequestBtn.addEventListener("click", async () => {
            try {
              await fetch(`${API_URL}/jobs/${job.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "Closed" }),
              });

              alert("Job request closed!");
              loadJobs();
            } catch (error) {
              alert("Unable to close job request!");
            }
          });
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (currentUser) {
    loadJobs();
  }
}

// Load Admin Dashboard Jobs
const adminJobsContainer = document.getElementById("adminJobsContainer");

if (adminJobsContainer) {
  const currentAdmin = requireAdmin();

  const loadAdminJobs = async () => {
    try {
      const response = await fetch(`${API_URL}/jobs`);
      const jobs = await response.json();

      adminJobsContainer.innerHTML = "";

      jobs.forEach((job) => {
        const card = document.createElement("article");
        card.classList.add("job-request-card");

        card.innerHTML = `
          <div class="job-request-info">
            <h2>${job.title}</h2>
            <p>Status: ${job.status}</p>
            <p>Company: ${job.companyName}</p>
            <p>Department: ${job.department}</p>
            <p>Employment Type: ${job.employmentType}</p>
            <p>Work Type: ${job.workType}</p>
            <p>Location: ${job.location}</p>
            <p>Experience: ${job.experience}</p>
            <p>Salary: ${job.salary}</p>
          </div>
          <button class="view-details-btn">View Details</button>
        `;

        adminJobsContainer.appendChild(card);

        card
          .querySelector(".view-details-btn")
          .addEventListener("click", () => {
            localStorage.setItem("selectedJob", JSON.stringify(job));
            navigate("job-request-details.html");
          });
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (currentAdmin) {
    loadAdminJobs();
  }
}

// Load Job Details + Upload & Manage CVs (merged admin page)
const jobDetailsContainer = document.getElementById("jobDetailsContainer");

if (jobDetailsContainer) {
  const currentAdmin = requireAdmin();

  const job = JSON.parse(localStorage.getItem("selectedJob"));

  if (currentAdmin && job) {
    document.getElementById("jobTitle").textContent = job.title;
    document.getElementById("jobStatus").textContent = job.status;
    document.getElementById("jobCompany").textContent = job.companyName;
    document.getElementById("jobDepartment").textContent = job.department;
    document.getElementById("jobEmploymentType").textContent =
      job.employmentType;
    document.getElementById("jobWorkType").textContent = job.workType;
    document.getElementById("jobLocation").textContent = job.location;
    document.getElementById("jobExperience").textContent = job.experience;
    document.getElementById("jobSalary").textContent = job.salary;
    document.getElementById("jobDescription").textContent = job.description;
    document.getElementById("jobRequirements").textContent = job.requirements;

    const cvUpload = document.getElementById("cvUpload");
    const uploadedCvsContainer = document.getElementById(
      "uploadedCvsContainer",
    );

    // Holds the PDF files picked by the admin before they are sent
    let selectedFiles = [];

    const renderSelectedFiles = () => {
      uploadedCvsContainer.innerHTML = "";

      selectedFiles.forEach((file, index) => {
        const card = document.createElement("article");
        card.classList.add("cv-card");

        card.innerHTML = `
          <div class="cv-info">
            <h3>${file.name}</h3>
            <p>PDF File</p>
          </div>
          <button class="remove-btn">Remove</button>
        `;

        uploadedCvsContainer.appendChild(card);

        card.querySelector(".remove-btn").addEventListener("click", () => {
          selectedFiles.splice(index, 1);
          renderSelectedFiles();
        });
      });
    };

    cvUpload.addEventListener("change", () => {
      selectedFiles = selectedFiles.concat(Array.from(cvUpload.files));
      cvUpload.value = "";
      renderSelectedFiles();
    });

    // Send to Client: creates one Candidate per selected PDF file
    const sendClientBtn = document.querySelector(".send-client-btn");

    sendClientBtn.addEventListener("click", async () => {
      if (selectedFiles.length === 0) {
        alert("Please select at least one CV file first!");
        return;
      }

      try {
        for (const file of selectedFiles) {
          const newCandidate = {
            jobId: job.id,
            companyName: job.companyName,
            name: file.name.replace(/\.pdf$/i, ""),
            experience: "Not specified",
            status: "Pending",
            cv: file.name,
          };

          await fetch(`${API_URL}/candidates`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newCandidate),
          });
        }

        alert("CVs sent successfully!");
        selectedFiles = [];
        renderSelectedFiles();
      } catch (error) {
        alert("Unable to send CVs!");
      }
    });
  }
}

// Load Candidates (Review Candidates page)
const candidatesContainer = document.getElementById("candidatesContainer");

if (candidatesContainer) {
  const currentUser = requireUser();
  const job = JSON.parse(localStorage.getItem("selectedJob"));

  if (currentUser && job) {
    document.getElementById("jobTitle").textContent = job.title;
    document.getElementById("jobStatus").textContent = job.status;
    document.getElementById("jobCompany").textContent = job.companyName;
    document.getElementById("jobDepartment").textContent = job.department;
    document.getElementById("jobEmploymentType").textContent =
      job.employmentType;
    document.getElementById("jobWorkType").textContent = job.workType;
    document.getElementById("jobLocation").textContent = job.location;
    document.getElementById("jobExperience").textContent = job.experience;
    document.getElementById("jobSalary").textContent = job.salary;
    document.getElementById("jobDescription").textContent = job.description;
    document.getElementById("jobRequirements").textContent = job.requirements;

    const loadCandidates = async () => {
      try {
        const response = await fetch(`${API_URL}/candidates`);
        const candidates = await response.json();

        const jobCandidates = candidates.filter(
          (candidate) => candidate.jobId === job.id,
        );

        candidatesContainer.innerHTML = "";

        jobCandidates.forEach((candidate) => {
          const card = document.createElement("article");
          card.classList.add("candidate-card");

          card.innerHTML = `
            <h2>${candidate.name}</h2>
            <p>${candidate.experience} - ${candidate.status}</p>
            <div class="candidate-actions">
              <button class="view-cv-btn">View CV</button>
              <div class="decision-actions">
                <button class="accept-btn">Accept</button>
                <button class="reject-btn">Reject</button>
              </div>
            </div>
          `;

          candidatesContainer.appendChild(card);

          card.querySelector(".view-cv-btn").addEventListener("click", () => {
            alert(`CV file: ${candidate.cv}`);
          });

          card.querySelector(".accept-btn").addEventListener("click", () => {
            updateCandidate(candidate.id, "Accepted", card);
          });

          card.querySelector(".reject-btn").addEventListener("click", () => {
            updateCandidate(candidate.id, "Rejected", card);
          });
        });
      } catch (error) {
        console.error(error);
      }
    };

    loadCandidates();
  }
}

async function updateCandidate(id, status, card) {
  try {
    await fetch(`${API_URL}/candidates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    alert(`Candidate ${status}`);
    card.remove();
  } catch (error) {
    alert("Unable to update candidate!");
  }
}
