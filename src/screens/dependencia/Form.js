import React, { useState, useEffect, createRef } from 'react';
import { useFormState, useResize, http } from 'gra-react-utils';
import { db } from '../../db';

import {
  Send as SendIcon,
  Keyboard,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  
  Box, Button, Card, CardContent, Stack, InputAdornment, TextField, Grid, Typography
} from '@mui/material';
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

export const Form = () => {
 
  const dispatch = useDispatch();

  const networkStatus = useSelector((state) => state.networkStatus);

  const { pid } = useParams();

  const formRef = createRef();

  const navigate = useNavigate();

  const [o, { defaultProps, validate, set }] = useFormState(useState, {

  }, {});

  useEffect(() => {
    dispatch({ type: 'title', title: (pid ? 'Actualizar' : 'Registrar') + ' Dependencia Policial' });
    [].forEach(async (e) => {
      e[1](await db[e[0]].toArray());
    });
  }, []);

  useEffect(() => {
    if (pid) {
      if (networkStatus.connected) {
        http.get(process.env.REACT_APP_PATH + '/dependencia/' + pid).then((result) => {
          set(result);
        });
      }
    } else {
      try {
        var s = localStorage.getItem("setting");
        if (s) {
          s = JSON.parse(s);
          var o2 = {};
          o2.name = s.name;
          o2.descripcion = s.descripcion;
          set({ ...o, ...o2 });
        }
      } catch (e) {
        console.log(e);
      }
    }
  }, [pid]);

  const { width, height } = useResize(React);

  useEffect(() => {
    if (formRef.current) {
      const header = document.querySelector('.MuiToolbar-root');
      const [body, toolBar] = formRef.current.children;
      const nav = document.querySelector('nav');
      body.style.height = (height - header.offsetHeight - toolBar.offsetHeight) + 'px';
      toolBar.style.width = (width - nav.offsetWidth) + 'px';
    }
  }, [width, height]);

  const onClickCancel = () => {
    navigate(-1);
  }

  const onClickSave = async () => {
    const form = formRef.current;
    if (0 || form != null && validate(form)) {

      var o2 = JSON.parse(JSON.stringify(o));
      if (networkStatus.connected) {
        http.post(process.env.REACT_APP_PATH + '/dependencia', o2).then(async (result) => {
          if (!o2._id) {
            if (result.id) {
              dispatch({ type: "snack", msg: 'Registro grabado!' });
              navigate('/dependencia', { replace: true });
            }
            else {
              navigate(-1);
            }
          }
        });
      }
    } else {
      dispatch({ type: "alert", msg: 'Falta campos por completar!' });
    }
  };

  const onSubmit = data => console.log(data);

  const theme = createTheme({
    components: {
      // Name of the component ⚛️
      MuiInput: {
        defaultProps: {
          required: true
        }
      },
    },
  });

  function getActions() {
    return <>
      <Button variant="contained" onClick={onClickCancel} color="error">
        Cancelar
      </Button>
      <Button disabled={o.old && !o.confirm} variant="contained" onClick={onClickSave} color="success" endIcon={<SendIcon />}>
        Grabar
      </Button>
    </>
  }

  function getContent() {
    return <LocalizationProvider dateAdapter={AdapterDayjs}><ThemeProvider theme={theme}>
      <form ref={formRef} onSubmit={onSubmit} style={{ textAlign: 'left' }}>
        <Box style={{ overflow: 'auto' }}>
          <Card className='mt-1 bs-black'>
            <CardContent>
              <Typography gutterBottom variant="h5" component="div" className='text-center fw-bold color-gore'>
                DATOS DE LA DEPENDENCIA
              </Typography>
              <Grid container>
                <Grid item xs={12} sm={12} md={12}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    size="medium"
                    id="standard-name"
                    label="Ingrese el nombre de la Dependencia Policial: "
                    placeholder="Dependencia Policial"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("name")}
                  />
                </Grid>
              </Grid>
              <Grid container>
                <Grid item xs={12} md={12}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    multiline
                    size="medium"
                    rows={4}
                    id="standard-name"
                    label="Ingrese la descripción: "
                    placeholder="Descripción"
                    {...defaultProps("descripcion", { required: false })}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
        <Stack direction="row" justifyContent="center"
          style={{ padding: '10px', backgroundColor: '#0f62ac' }}
          alignItems="center" spacing={1}>
          {getActions()}
        </Stack>
      </form>
    </ThemeProvider></LocalizationProvider>
  }
  return <>{
    1 == 1 ? <Box style={{ textAlign: 'left' }}>{getContent()}</Box>
      : <Box
        sx={{ display: 'flex' }}>
      </Box>
  }
  </>;

}