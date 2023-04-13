import React from "react";

const patients = [
    {
        patientDetails: {
            "First Name": "John",
            "Last Name": "Doe",
            DOB: "1923-02-19",
        },
        credits: {
            type: "old_regime",
            amount: 100,
        },
    },
    {
        patientDetails: {
            "First Name": "Jane",
            "Last Name": "Doe",
            DOB: "1823-03-01",
        },
        credits: {
            type: "new_regime",
            amount: 12,
        },
    },
    {
        patientDetails: {
            "First Name": "Devika",
            "Last Name": "Das",
            DOB: "2003-04-26",
        },
        credits: {
            type: "new_regime",
            amount: 8,
        },
    },

    {
        patientDetails: {
            "First Name": "Riswana",
            "Last Name": "U",
            DOB: "2022-02-20",
        },
        credits: {
            type: "new_regime",
            amount: 3,
        },
    },
];

function getAge(dateString) {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function PatientList() {
    const transformedPatients = patients.map((patient) => {
        const age = getAge(patient.patientDetails.DOB);
        return {
            "First Name": patient.patientDetails["First Name"],
            "Last Name": patient.patientDetails["Last Name"],
            age: age,
            type: patient.credits.type,
            amount: patient.credits.amount,
        };
    });

    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Age</th>
                        <th>Type</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {transformedPatients.map((patient) => (
                        <tr key={patient["First Name"]}>
                            <td>{patient["First Name"]}</td>
                            <td>{patient["Last Name"]}</td>
                            <td>{patient.age}</td>
                            <td>{patient.type}</td><br></br>
                            <td>{patient.amount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default PatientList;
