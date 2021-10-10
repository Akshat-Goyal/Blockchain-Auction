import Table from 'react-bootstrap/Table'
import 'bootstrap/dist/css/bootstrap.min.css';
import TableHeader from './tableHeader';
import TableBody from './tableBody';
// const data = [[1, 2, 3], [4, 5, 6]];

function ItemList() {
  return (
    <div>
        <Table striped bordered hover size="sm">
            <TableHeader />
            <TableBody />
      </Table>
      
    </div>
  );
}

export default ItemList;