import React from 'react';

interface TimestampProps {
  timestamp: number;
}

const FormattedTimestamp: React.FC<TimestampProps> = ({timestamp}) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000); // 转换为毫秒

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() 返回 0-11
    const year = date.getFullYear();

    return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
  };

  return (
    <>Time: {formatDate(timestamp)}</>
  );
};

export default FormattedTimestamp;
