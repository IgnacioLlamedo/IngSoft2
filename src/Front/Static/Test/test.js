const header = document.querySelector("header");

const userAutoLogin = document.createElement("button");
const employeeAutoLogin = document.createElement("button");
const adminAutoLogin = document.createElement("button");

userAutoLogin.textContent = "UserAutoLogin";
employeeAutoLogin.textContent = "EmployeeAutoLogin";
adminAutoLogin.textContent = "AdminAutoLogin";

header.after(adminAutoLogin);
header.after(employeeAutoLogin);
header.after(userAutoLogin);

userAutoLogin.addEventListener("click", async (event) => {
    const res = await fetch("/api/test/user-autologin", {
        method: 'POST'
    });
    
    const resData = await res.json();

    if(resData.success)
        window.location.href = resData.redirect;
    else
        console.error(resData.message);
})

employeeAutoLogin.addEventListener("click", async (event) => {
    const res = await fetch("/api/test/employee-autologin", {
        method: 'POST'
    });
    
    const resData = await res.json();

    if(resData.success)
        window.location.href = resData.redirect;
    else
        console.error(resData.message);
})

adminAutoLogin.addEventListener("click", async (event) => {
    const res = await fetch("/api/test/admin-autologin", {
        method: 'POST'
    });
    
    const resData = await res.json();

    if(resData.success)
        window.location.href = resData.redirect;
    else
        console.error(resData.message);
})




