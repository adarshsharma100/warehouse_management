import { cities } from "app/constants";
import { type } from "os";
// import classNames from "classnames";
// import { useFormik } from "formik";
import { AutoComplete } from "primereact/autocomplete";
import { InputText } from "primereact/inputtext";
import { useState } from "react";


const AddressComponent = ({ value, setField, addressName }) => {
    console.log('props: ', value);

    const [addressSuggestion, setAddressSuggestion] = useState<any>(null)
    const searchCities = (event: { query: string }) => {
        setTimeout(() => {
            let _filteredSuggestions
            if (!event.query.trim().length) {
                _filteredSuggestions = [...cities]
                console.log("searchCity -", _filteredSuggestions)
            } else {
                _filteredSuggestions = cities.filter((element) => {
                    console.log("searchCity +",_filteredSuggestions)
                    return element.city.toLowerCase().startsWith(event.query.toLowerCase())
                })
            }

            setAddressSuggestion(_filteredSuggestions)
        }, 50)
    }


    // const formik = useFormik({
    //     initialValues: {
    //         address: '',
    //         pincode: '',
    //         city: '',
    //         state: '',
    //         country: '',
    //         areaStreet: '',
    //         landmarkName: '',
    //         bulidingNumber: '',
    //     },
    //     onSubmit: (data) => {
    //         console.log(data, 'data');
    //     },
    // });
    // const isFormFieldValid = (name) => !!(value.touched[name] && value.errors[name])
    // const getFormErrorMessage = (name) => {
    //     return isFormFieldValid(name) && <small className="p-error">{value.errors[name]}</small>
    // }



    return (


        <>
            <pre>{JSON.stringify(value, null, 2)}</pre>

            <div className="formgrid grid">
                {[
                    // { field: "contactNumber", label: "Contact Number" },
                    { label: "Address", field: "address" },
                    { label: "Area Street", field: "areaStreet" },
                    { label: "LandMark", field: "landmark" },
                    { label: "Building Number", field: "bulidingNumber" },
                    { label: "Pincode", field: "pincode" },
                    // { label: "City", field: "city" },
                ].map((ele, i) => {
                    return (
                        <div key={`${ele.label}${i}`} className="field col-12 lg:col-2 md:col-6 mt-4">
                            <span className="p-float-label">
                                <InputText
                                    // disabled={productEditState}
                                    id={ele.field}
                                    name={ele.field}
                                    value={value?.[ele.field]}
                                    onChange={(e) => {

                                        console.log('value: ', e.target.value);
                                        setField(addressName, { ...value, [ele.field]: e.target.value })

                                    }}
                                    autoFocus
                                // className={classNames({ "p-invalid": isFormFieldValid(ele.field) })}
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
                                let city = typeof e.value === "string" ? e.target.value: e.target.value.city
                                let state = typeof e.value === "string" ? "" : e.target.value.state
                                let country = typeof e.value === "string" ? "" : "India"
                                console.log(city, "City")
                                setField({ ...value, city, state, country })
                                // setField({...value, city})
                                console.log('setField: ', { ...value, city });
                            }}
                            aria-label="cities"
                            dropdownAriaLabel="Select City"
                        // className={classNames({ "p-invalid": isFormFieldValid("city") })}
                        // disabled={!vendorEditState}
                        />

                        <label
                            htmlFor="vendor_city"
                        // className={classNames({ "p-error": isFormFieldValid("city") })}
                        >
                            City
                        </label>
                    </div>
                    {/* {getFormErrorMessage("city")} */}
                </div>


                <div className="field col-12 md:col-3 lg:col-2 mt-4">
                    <span className="p-float-label">
                        <InputText
                            id="state"
                            value={value?.state}
                            // className={classNames({ "p-invalid": isFormFieldValid("state") })}
                            // disabled={!vendorEditState}
                            // onChange={value.handleChange}
                            onChange={(e) => {
                                setField({ ...value, state: e.target.value })
                            }}
                        />
                        <label
                            htmlFor="state"
                        // className={classNames({ "p-error": isFormFieldValid("state") })}
                        >
                            State
                        </label>
                    </span>
                    {/* {getFormErrorMessage("state")} */}
                </div>

                <div className="field col-12 md:col-3 lg:col-2 mt-4">
                    <span className="p-float-label">
                        <InputText
                            id="country"
                            value={value?.country}
                            // className={classNames({ "p-invalid": isFormFieldValid("country") })}
                            // disabled={!vendorEditState}
                            // onChange={value.handleChange}
                            onChange={(e) => {
                                setField({ ...value, country: e.target.value })
                            }}
                        />
                        <label
                            htmlFor="country"
                        // className={classNames({ "p-error": isFormFieldValid("country") })}
                        >
                            Country
                        </label>
                    </span>
                    {/* {getFormErrorMessage("country")} */}
                </div>



            </div>
        </>
    );
};

export default AddressComponent;


    // <>
        //     <InputText type="text" value={address} onChange={handleAddressChange} />
        //     <InputText type="text" value={pincode} onChange={handlePincodeChange} />
        //     <InputText type="text" value={streetAddress} onChange={handleStreetAddressChange} />
        //     <InputText type="text" value={landmark} onChange={handleLandmarkChange} />
        //     <InputText type="text" value={building} onChange={handleBuildingChange} />


        //     <div className="field col-12 md:col-3 lg:col-2 mt-4">
        //         <div className="p-float-label">
        //           <AutoComplete
        //             id="city"
        //             // value={formik.values.city}
        //             // suggestions={addressSuggestion}
        //             // completeMethod={searchCities}
        //             field="city"
        //             onChange={async (e) => {
        //               let city = typeof e.value === "string" ? e.value : e.value.city
        //               let state = typeof e.value === "string" ? " " : e.value.state
        //               let country = typeof e.value === "string" ? "" : "India"

        //             //   await formik.setValues({ ...formik.values, city, state, country })
        //             }}
        //             aria-label="cities"
        //             dropdownAriaLabel="Select City"
        //             // className={classNames({ "p-invalid": isFormFieldValid("city") })}
        //           // disabled={!vendorEditState}
        //           />

        //           <label
        //             htmlFor="vendor_city"
        //             // className={classNames({ "p-error": isFormFieldValid("city") })}
        //           >
        //             City
        //           </label>
        //         </div>
        //         {/* {getFormErrorMessage("city")} */}
        //       </div>


        //       <div className="field col-12 md:col-3 lg:col-2 mt-4">
        //         <span className="p-float-label">
        //           <InputText
        //             id="state"
        //             // value={formik.values.state}
        //             // className={classNames({ "p-invalid": isFormFieldValid("state") })}
        //             // disabled={!vendorEditState}
        //             // onChange={formik.handleChange}
        //           />
        //           <label
        //             htmlFor="state"
        //             // className={classNames({ "p-error": isFormFieldValid("state") })}
        //           >
        //             State
        //           </label>
        //         </span>
        //         {/* {getFormErrorMessage("state")} */}
        //       </div>

        //       <div className="field col-12 md:col-3 lg:col-2 mt-4">
        //         <span className="p-float-label">
        //           <InputText
        //             id="country"
        //             // value={formik.values.country}
        //             // className={classNames({ "p-invalid": isFormFieldValid("country") })}
        //             // disabled={!vendorEditState}
        //             // onChange={formik.handleChange}
        //           />
        //           <label
        //             htmlFor="country"
        //             // className={classNames({ "p-error": isFormFieldValid("country") })}
        //           >
        //             Country
        //           </label>
        //         </span>
        //         {/* {getFormErrorMessage("country")} */}
        //       </div>
        // </>