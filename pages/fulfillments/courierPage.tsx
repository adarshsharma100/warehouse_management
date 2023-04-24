import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
// import CourierServices from './CourierServices'; // assuming CourierServices is defined in a separate file

function CourierPage() {
  const [selectedType, setSelectedType] = useState('');
  const [selectedCourier, setSelectedCourier] = useState('');

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
    setSelectedCourier('');
  };

  const handleCourierChange = (event) => {
    setSelectedCourier(event.target.value);
  };


  useEffect(() => {
  }, []);

  const typeOptions = [
    // { label: 'Select a type', value: '' },
    { label: 'Online', value: 'online' },
    { label: 'Local', value: 'local' },
  ];

  const courierOptions = [
    // { label: 'Select a courier', value: '' },
    { label: 'DTDC', value: 'dtdc', type: 'online' },
    { label: 'Blue Dart', value: 'blue_dart', type: 'local' },
    { label: 'Delhivery', value: 'delhivery', type: 'online' },
    { label: 'DHL', value: 'dhl', type: 'online' },
  ];

  const filteredCouriers = courierOptions.filter(
    (courier) => courier.type === selectedType || selectedType === ''
  );

  const handleCancel = () => {
    setSelectedType('');
    setSelectedCourier('');
  };

  const handleSubmit = () => {
    console.log('Selected courier:', selectedCourier);
    handleCancel();
  };

  return (
    <Card title="Courier">
      <div className="formgrid grid">
        <div className="p-field">
          {/* <label htmlFor="type-dropdown">Select a type:</label> */}
          <span className="p-float-label">
          <Dropdown
            id="type-dropdown"
            value={selectedType}
            options={typeOptions}
            onChange={handleTypeChange}
            placeholder="Select a type"
            
          />

<label htmlFor="courier">Courier Type</label>
                            </span>
        </div>
        <div className="field col-2 md:col-6 lg:col-2">
          {/* <label htmlFor="courier-dropdown">Select a courier:</label> */}
          <span className="p-float-label">
          <Dropdown
            id="courier-dropdown"
            value={selectedCourier}
            options={filteredCouriers}
            onChange={handleCourierChange}
            placeholder="Select a courier"
            disabled={filteredCouriers.length === 0}
            
          />
           <label htmlFor="courier">Selected Courier</label>
                            </span>
        </div>
      </div>

      <div className="p-d-flex p-jc-between">
        <Button
          label="Submit"
          className="p-button-success"
          onClick={handleSubmit}
          disabled={!selectedCourier}
        />
        <Button label="Cancel" className="p-button-secondary" onClick={handleCancel} />
      </div>
    </Card>
  );
}

export default CourierPage;
