import { cities } from "app/constants";
import classNames from "classnames";
import { type } from "os";
// import classNames from "classnames";
// import { useFormik } from "formik";
import { AutoComplete } from "primereact/autocomplete";
import { InputText } from "primereact/inputtext";
import { useState } from "react";


const AddressComponent = ({ value, setField, addressName, errors, }) => {
    console.log('shippErrors ', errors);

    const [addressSuggestion, setAddressSuggestion] = useState<any>(null)
    const searchCities = (event: { query: string }) => {
        setTimeout(() => {
            let _filteredSuggestions
            if (!event.query.trim().length) {
                _filteredSuggestions = [...cities]
            } else {
                _filteredSuggestions = cities.filter((element) => {
                    return element.city.toLowerCase().startsWith(event.query.toLowerCase())
                })
            }

            setAddressSuggestion(_filteredSuggestions)
        }, 50)
    }


    // const isFormFieldValid = (name) => !!(value.touched[name] && errors[name])
    // const getFormErrorMessage = (name) => {
    //     return isFormFieldValid(name) && <small className="p-error">{errors[name]}</small>
    // }


  

    return (

        <>
            <div className="formgrid grid">
                {[
                    { label: "Address", field: "address" },
                    { label: "LandMark", field: "landmark" },
                    { label: "Pincode", field: "pincode" },
                    { label: "Email ID", field: "email", },
                    { label: "Contact Number", field: "contactNumber", },
                ].map((ele, i) => {
                    return (
                        <div key={`${ele.label}${i}`} className="field col-12 lg:col-2 md:col-6 mt-4">
                            <span className="p-float-label">
                                <InputText
                                    id={ele.field}
                                    name={ele.field}
                                    value={value?.[ele.field]}

                                    onChange={(e) => {

                                        console.log('value: ', e.target.value);
                                        setField(addressName, { ...value, [ele.field]: e.target.value })
                                    }}
                                    autoFocus

                                />
                                <label
                                    htmlFor={ele.label}
                                // className={classNames({ "p-error": isFormFieldValid(ele.field) })}
                                >
                                    {ele.label}
                                </label>
                            </span>
                            {/* {getFormErrorMessage(ele.field)} */}

                        </div>
                    )

                })
                }

                <div className="field col-12 md:col-3 lg:col-2 mt-4">
                    <div className="p-float-label">
                        <AutoComplete
                            id="city"
                            value={value?.city}
                            suggestions={addressSuggestion}
                            completeMethod={searchCities}
                            field="city"
                            onChange={(e) => {
                                console.log("e.value", e.value)
                                let city = typeof e.target.value === "string" ? e.target.value : e.target.value.city
                                let state = typeof e.target.value === "string" ? "" : e.target.value.state
                                let country = typeof e.target.value === "string" ? "" : "India"
                                console.log(city, "City")
                                setField(addressName, { ...value, city, state, country })

                                console.log('setField: ', { ...value, city });
                            }}
                            aria-label="cities"
                            dropdownAriaLabel="Select City"

                        />

                        <label htmlFor="vendor_city">
                            City
                        </label>
                    </div>

                </div>


                <div className="field col-12 md:col-3 lg:col-2 mt-4">
                    <span className="p-float-label">
                        <InputText
                            id="state"
                            value={value?.state}

                            onChange={(e) => {
                                setField({ ...value, state: e.target.value })
                            }}
                        />
                        <label htmlFor="state">
                            State
                        </label>
                    </span>

                </div>

                <div className="field col-12 md:col-3 lg:col-2 mt-4">
                    <span className="p-float-label">
                        <InputText
                            id="country"
                            value={value?.country}

                            onChange={(e) => {
                                setField({ ...value, country: e.target.value })
                            }}
                        />
                        <label htmlFor="country">
                            Country
                        </label>
                    </span>

                </div>



            </div>
        </>
    );
};

export default AddressComponent;


