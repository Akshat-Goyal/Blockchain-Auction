import Table from 'react-bootstrap/Table'
import TableRow from './tableRow';
import 'bootstrap/dist/css/bootstrap.min.css';

const data  = 
[
  {
    listingID : "listingID",
    name : "name", 
    description : "description",
    // price;
    // payable sellerID;
    // itemStatus;
    // buyerID;
    // encryptedString;
  },
  {
    listingID : "listingID",
    name : "name", 
    description : "description",
    // price;
    // payable sellerID;
    // itemStatus;
    // buyerID;
    // encryptedString;
  }
];

function getRows()
{
  const rows=[];
  for(var i=0; i<data.length; i++)
  {
    rows.push(<TableRow rowdata = {data[i]}/>)
  }
  return rows;
}

function TableBody() {
  return (
    <tbody>
      {getRows()}
      
  </tbody>    
  );
}

export default TableBody;