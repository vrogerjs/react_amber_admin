import React, { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { db } from '../../db';
import {
  Button, Checkbox, Fab, styled, Table, TableCell, TextField, TablePagination,
  TableHead, TableBody, TableRow, TableContainer, Toolbar, Grid, CardContent, Card
} from '@mui/material';
import { Autorenew, PersonSearch, PictureAsPdf, TaskAlt } from '@mui/icons-material';
import { http, useResize, useFormState } from 'gra-react-utils';
import { tableCellClasses } from '@mui/material/TableCell';
import { useDispatch, useSelector } from "react-redux";
import {
  useNavigate
} from "react-router-dom";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    textAlign: 'center',
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const List = () => {

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [state, setState] = useState({ page: 0, rowsPerPage: 50 });

  const [result, setResult] = useState({ size: 0, data: [] });

  const [selected, setSelected] = React.useState([]);

  const isSelected = (code) => selected.indexOf(code) !== -1;

  const networkStatus = useSelector((state) => state.networkStatus);

  const pad = (num, places) => String(num).padStart(places, '0')

  const onChangeAllRow = (event) => {
    if (event.target.checked) {
      const newSelected = result.data.map((row) => toID(row));
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const onClickRow = (event, code) => {
    const selectedIndex = selected.indexOf(code);

    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, code);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const emptyRows = result.data && result.data.length;

  const onPageChange = (
    event, page
  ) => {
    setState({ ...state, page: page });
  };

  const onRowsPerPageChange = (
    event
  ) => {
    setState({ ...state, rowsPerPage: event.target.value });
  };

  const onClickRefresh = () => {
    setSelected([]);
    fetchData(state.page);
  }

  const fetchData = async (page) => {
    var data = { data: [] };
    if (networkStatus.connected) {
      const result = await http.get(process.env.REACT_APP_PATH + '/desaparecido/' + page + '/' + state.rowsPerPage + '?estado=0');
      data.size = result.size;
      data.data = data.data.concat(result.content);
    }
    setResult(data);
  };

  const { height, width } = useResize(React);

  useEffect(() => {
    const header = document.querySelector('.MuiToolbar-root');
    const tableContainer = document.querySelector('.MuiTableContainer-root');
    const nav = document.querySelector('nav');
    const toolbarTable = document.querySelector('.Toolbar-table');
    const tablePagination = document.querySelector('.MuiTablePagination-root');

    if (tableContainer) {
      tableContainer.style.width = (width - nav.offsetWidth) + 'px';
      tableContainer.style.height = (height - header.offsetHeight
        - toolbarTable.offsetHeight - tablePagination.offsetHeight) + 'px';
    }
  }, [height, width]);

  useEffect(() => {
    dispatch({ type: 'title', title: 'Gestión de Desaparecidos' });
    fetchData(state.page)
  }, [state.page, state.rowsPerPage]);

  const [o, { defaultProps }] = useFormState(useState, {}, {});

  const createOnClick = () => {
    navigate('/desaparecido/create');
  };

  const editOnClick = () => {
    navigate('/desaparecido/' + selected[0] + '/edit');
  }

  const verAlertaOnClick = () => {
    navigate('/desaparecido/alerta/' + selected[0]);
  }

  const onClickEncontrar = () => {
    dispatch({
      type: "confirm", msg: 'Se encontro a la persona seleccionada?', cb: (e) => {
        if (e) {
          http.get(process.env.REACT_APP_PATH + '/desaparecido/change/' + selected[0] + '?estado=1').then(e => {
            navigate('/desaparecido');
            dispatch({ type: "snack", msg: 'Persona encontrada.!' });
          });
        }
      }
    });
  };


  const toID = (row) => {
    return row._id && row._id.$oid ? row._id.$oid : row.id;
  }
  return (
    <>
      <Card>
        <CardContent sx={{ padding: '0px' }}>
          <Toolbar className="Toolbar-table" direction="row" >
            <Grid container spacing={2} sx={{ marginY: '1em !important' }}>
              <Grid item xs={12} sm={12} md={3}>
                <Button sx={{ width: '100%', fontWeight: 'bold' }} startIcon={<TaskAlt />} onClick={createOnClick} variant="contained" color="primary">Registrar</Button>
              </Grid>
              <Grid item xs={12} sm={12} md={3}>
                <Button sx={{ width: '100%', fontWeight: 'bold' }} disabled={!selected.length} startIcon={<EditIcon />} onClick={editOnClick} variant="contained" color="primary">Editar</Button>
              </Grid>
              <Grid item xs={12} sm={12} md={3}>
                <Button sx={{ width: '100%', fontWeight: 'bold' }} disabled={!selected.length} startIcon={<PictureAsPdf />} onClick={verAlertaOnClick} variant="contained" color="primary">Ver Alerta</Button>
              </Grid>
              <Grid item xs={12} sm={12} md={3}>
                <Button sx={{ width: '100%', fontWeight: 'bold' }} disabled={!selected.length} onClick={onClickEncontrar} startIcon={<PersonSearch />} variant="contained" color="primary">Cambiar estado</Button>
              </Grid>
            </Grid>
          </Toolbar>
          <TableContainer sx={{ maxWidth: '100%', mx: 'auto', maxHeight: '540px' }}>
            <Table stickyHeader aria-label="sticky table" className='mt-5'>
              <TableHead>
                <TableRow>
                  <StyledTableCell padding="checkbox" className='bg-gore border-table'>
                    <Checkbox
                      style={{ color: 'white' }}
                      indeterminate={selected.length > 0 && selected.length < result.data.length}
                      checked={result && result.data.length > 0 && selected.length === result.data.length}
                      onChange={onChangeAllRow}
                      inputProps={{
                        'aria-label': 'select all desserts',
                      }}
                    />
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '15%', maxWidth: '15%' }} className='bg-gore border-table'>DNI
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Apellidos y Nombres
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Fecha de Nacimiento
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '15%', maxWidth: '15%' }} className='bg-gore border-table'>Nº Denuncia
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Lugar del Hecho
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(result && result.data && result.data.length ? result.data : [])
                  .map((row, index) => {
                    const isItemSelected = isSelected(toID(row));
                    return (
                      <StyledTableRow
                        style={{ backgroundColor: (1) ? '' : (index % 2 === 0 ? '#f1f19c' : '#ffffbb') }}
                        hover
                        onClick={(event) => onClickRow(event, toID(row))}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={index + ' ' + toID(row)}
                        selected={isItemSelected}
                      >
                        <TableCell padding="checkbox" className='border-table'>
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                          />
                        </TableCell>
                        <TableCell style={{ width: '15%', maxWidth: '15%' }} className='border-table' align="center">
                          {row.persona.dni}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }}>
                          {row.persona.nombres} {row.persona.apePaterno} {row.persona.apeMaterno}
                        </TableCell>
                        <TableCell style={{ width: '20%', maxWidth: '20%' }} className='border-table' align="center">
                          {pad(row.persona.fechaNacimiento[2], 2)}/{pad(row.persona.fechaNacimiento[1], 2)}/{row.persona.fechaNacimiento[0]}
                        </TableCell>
                        <TableCell style={{ minWidth: '15%', maxWidth: '15%' }} className='border-table' align="center">
                          {row.nroDenuncia}
                        </TableCell>
                        <TableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='border-table'>
                          {row.lugarHecho}
                        </TableCell>
                      </StyledTableRow >
                    );
                  })}
                {(!emptyRows) && (
                  <TableRow style={{ height: 53 }}>
                    <TableCell colSpan={7} >
                      No data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 20, 50]}
            component="div"
            count={result.size}
            rowsPerPage={state.rowsPerPage}
            page={state.page}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
          />
        </CardContent>
      </Card>
    </>
  );

};

export default List;