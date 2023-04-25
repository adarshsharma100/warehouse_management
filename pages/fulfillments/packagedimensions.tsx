import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { Button } from 'primereact/button';
import classNames from 'classnames';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';

const PackageDimensions = () => {
  const [countries, setCountries] = useState([]);
  const [showMessage, setShowMessage] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {

  }, []);

  const formik = useFormik({
    initialValues: {
      length: null,
      width: null,
      height: null,
      weight: null,

    },

    onSubmit: (data) => {
      setFormData(data);
      setShowMessage(true);

      formik.resetForm();
    }
  });

console.log("Formik",formik.values)
  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);

  return (
    <>
    <form className="p-fluid" onSubmit={formik.handleSubmit}>

<div className="card">
  <h1>Package Dimensions</h1>

  <div className="formgrid grid">
    {[
      { type: 'number', label: 'Length', field: 'length' },
      { type: 'number', label: 'Width', field: 'width' },
      { type: 'number', label: 'Height', field: 'height' },
      { type: 'number', label: 'Weight', field: 'weight' },
    ].map((fieldObj, i) => {
      const { type, label, field } = fieldObj || {};
      return (
        <div key={i} className='field col-10 md:col-3 lg:col-3 mt-4'>
          <span className="p-float-label">
            <InputText
              id={field}
              name={field}
              value={formik.values[field]}
              onChange={formik.handleChange}
              autoFocus
              className={classNames({ "p-invalid": isFormFieldValid(field) })}
            />
            <label
              htmlFor={field}
              className={classNames({ "p-error": isFormFieldValid(field) })}
            >
              {label}
            </label>
          </span>
        </div>
      )
    })}
  </div>

  <div className="flex justify-content-end">
    <Button
      type="submit"
      className="mr-2"
      label="SUBMIT"
    />
    <Button
      className="p-button-secondary flex-grow-0"
      style={{ maxWidth: "50%" }}
      type="button"
      label="CANCEL"
      onClick={() => {
      }}
    />
  </div>
</div>

</form>
<pre>{}</pre>
    </>
  );
}
export default PackageDimensions
