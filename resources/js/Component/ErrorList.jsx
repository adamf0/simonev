import React from 'react';

const ErrorList = ({ errors }) => {
  return (
    errors && errors.length > 0 ? (
      <small className="text-danger">
        <ol>
          {errors.map((err, index) => (
            <li key={index}>{err}</li>
          ))}
        </ol>
      </small>
    ) : null
  );
};

export default ErrorList;
