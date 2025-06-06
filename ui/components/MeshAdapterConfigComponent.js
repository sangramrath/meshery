import React, { useEffect, useState, useRef } from 'react';
import { Grid2, Chip, Button, TextField, Tooltip, Avatar, styled } from '@sistent/sistent';
import { NoSsr } from '@sistent/sistent';
import ReactSelectWrapper from './ReactSelectWrapper';

import changeAdapterState from './graphql/mutations/AdapterStatusMutation';
import { useNotification } from '../utils/hooks/useNotification';
import { EVENT_TYPES } from '../lib/event-types';
import BadgeAvatars from './CustomAvatar';
import { keys } from '@/utils/permission_constants';
import CAN from '@/utils/can';
import { iconMedium } from 'css/icons.styles';
import {
  useGetAdaptersQuery,
  useGetAvailableAdaptersQuery,
  useLazyPingAdapterQuery,
  useManageAdapterMutation,
} from '@/rtk-query/system';
import { updateProgress } from '@/store/slices/mesheryUi';
import { useDispatch, useSelector } from 'react-redux';
import { updateAdaptersInfo } from '@/store/slices/adapter';

const WrapperStyledDiv = styled('div')(({ theme }) => ({
  padding: theme.spacing(5),
  backgroundColor: theme.palette.background.card,
  borderBottomLeftRadius: theme.spacing(1),
  borderBottomRightRadius: theme.spacing(1),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const AdapterButtons = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  paddingTop: '2rem',
});

const AdapterButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(1),
}));

const AlignRight = styled('div')(({ theme }) => ({
  textAlign: 'right',
  marginBottom: theme.spacing(2),
}));

const AdapterChipStyled = styled(Chip)(({ theme }) => ({
  marginRight: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const STATUS = {
  DEPLOYED: 'DEPLOYED',
  UNDEPLOYED: 'UNDEPLOYED',
  DEPLOYING: 'DEPLOYING',
  UNDEPLOYING: 'UNDEPLOYING',
};

const MeshAdapterConfigComponent = () => {
  const labelRef = useRef(null);
  const { meshAdapters: globalAdapters } = useSelector((state) => state.adapter);
  const { meshAdaptersts: meshAdapterStates } = useSelector((state) => state.adapter);
  const [meshAdapters, setMeshAdapters] = useState(globalAdapters);
  const [ts, setTs] = useState(meshAdapterStates);
  const [meshLocationURLError, setMeshLocationURLError] = useState(false);
  const [selectedAvailableAdapterError, setSelectedAvailableAdapterError] = useState(false);
  const [adapterStates, setAdapterStates] = useState(meshAdapterStates);
  const [meshLocationURL, setMeshLocationURL] = useState();
  const [meshDeployURL, setMeshDeployURL] = useState('');
  const [meshDeployURLError, setMeshDeployURLError] = useState();
  const [selectedAvailableAdapter, setSelectedAvailableAdapter] = useState();
  const { notify } = useNotification();

  const { data: adapters } = useGetAdaptersQuery();
  const { data: availableAdaptersData } = useGetAvailableAdaptersQuery();
  const [pingAdapter] = useLazyPingAdapterQuery();
  const [manageAdapter] = useManageAdapterMutation();
  const dispatch = useDispatch();

  const setAdapterURLs =
    adapters?.map((res) => ({
      value: res.adapter_location,
      label: res.adapter_location,
    })) || [];

  const availableAdapters =
    availableAdaptersData?.map((res) => ({
      value: res.adapter_location,
      label: res.name,
    })) || [];

  useEffect(() => {
    if (meshAdapterStates > ts) {
      setMeshAdapters(meshAdapters);
      setTs(meshAdapterStates);
    }
  }, [meshAdapterStates, ts]);

  useEffect(() => {
    setAdapterStatesFunction();
  }, [meshAdapters]);

  const setAdapterStatesFunction = () => {
    const initialAdapterStates = {};

    meshAdapters.forEach((adapter) => {
      const label = adapter.name.toUpperCase();
      initialAdapterStates[label] = STATUS.UNDEPLOYED;
    });

    setAdapterStates(initialAdapterStates);
  };

  const getStatusColor = (status) => {
    if (status === STATUS.DEPLOYED) {
      return '#00B39F';
    } else if (status === STATUS.UNDEPLOYED) {
      return '#808080';
    } else if (status === STATUS.DEPLOYING) {
      return '#EBC017';
    } else if (status === STATUS.UNDEPLOYING) {
      return '#E75225';
    }
  };

  // const handleChange = (name) => (event) => {
  //   if (name === "meshLocationURL" && event.target.value !== "") {
  //     setMeshLocationURLError(false);
  //   }

  //   setStateValues(prevState => ({
  //     ...prevState,
  //     [name] : event.target.value
  //   }));
  // };
  const handleMeshLocURLChange = (newValue) => {
    if (typeof newValue !== 'undefined') {
      setMeshLocationURL(newValue);
      setMeshLocationURLError(false);
    }
  };
  const handleDeployPortChange = (newValue) => {
    if (typeof newValue !== 'undefined') {
      setMeshDeployURL(newValue.value);
      setMeshDeployURLError(false);
    }
  };

  const handleAvailableAdapterChange = (newValue) => {
    if (typeof newValue !== 'undefined') {
      // Trigger label animation manually
      labelRef.current.querySelector('label').classList.add('MuiInputLabel-shrink');
      setSelectedAvailableAdapter(newValue);
      setSelectedAvailableAdapterError(false);

      if (newValue !== null) {
        setMeshDeployURL(newValue.value);
        setMeshDeployURLError(false);
      }
    }
  };

  const handleSubmit = () => {
    if (!meshLocationURL || !meshLocationURL.value || meshLocationURL.value === '') {
      setMeshLocationURLError(true);
      return;
    }

    submitConfig();
  };

  const submitConfig = async () => {
    updateProgress({ showProgress: true });

    try {
      const result = await manageAdapter({
        meshLocationURL: meshLocationURL.value,
      }).unwrap();

      updateProgress({ showProgress: false });

      if (result) {
        setMeshAdapters(result);
        setMeshLocationURL('');
        notify({ message: 'Adapter configured.', event_type: EVENT_TYPES.SUCCESS });
        dispatch(updateAdaptersInfo({ meshAdapters: result }));
      }
    } catch (error) {
      handleError('Adapter was not configured due to an error')(error);
    }
  };

  const handleDelete = (adapterLoc) => async () => {
    updateProgress({ showProgress: true });

    try {
      const result = await manageAdapter({
        method: 'DELETE',
        adapter: adapterLoc,
      }).unwrap();

      updateProgress({ showProgress: false });

      if (result) {
        setMeshAdapters(result);
        notify({ message: 'Adapter removed.', event_type: EVENT_TYPES.SUCCESS });
        dispatch(updateAdaptersInfo({ meshAdapters: result }));
      }
    } catch (error) {
      handleError('Adapter was not removed due to an error')(error);
    }
  };

  const handleClick = (adapterLoc) => async () => {
    updateProgress({ showProgress: true });

    try {
      const result = await pingAdapter(adapterLoc).unwrap();

      updateProgress({ showProgress: false });

      if (result) {
        notify({ message: 'Adapter was pinged.', event_type: EVENT_TYPES.SUCCESS });
      }
    } catch (error) {
      handleError('Error pinging adapter')(error);
    }
  };

  const handleAdapterDeploy = () => {
    if (
      !selectedAvailableAdapter ||
      !selectedAvailableAdapter.value ||
      selectedAvailableAdapter.value === ''
    ) {
      setSelectedAvailableAdapterError(true);
      return;
    }

    const adapterLabel = selectedAvailableAdapter.label.replace(/^meshery-/, '').toUpperCase();
    setAdapterStates((prevState) => ({
      ...prevState,
      [adapterLabel]: STATUS.DEPLOYING,
    }));

    if (!meshDeployURL || meshDeployURL === '') {
      setMeshDeployURLError(true);
      return;
    }

    updateProgress({ showProgress: true });

    const variables = {
      status: 'ENABLED',
      adapter: selectedAvailableAdapter.label,
      targetPort: meshDeployURL,
    };

    changeAdapterState((response, errors) => {
      updateProgress({ showProgress: false });

      if (errors !== undefined) {
        handleError('Unable to Deploy adapter');
        setAdapterStates((prevState) => ({
          ...prevState,
          [adapterLabel]: STATUS.UNDEPLOYED,
        }));
      }

      setAdapterStates((prevState) => ({
        ...prevState,
        [adapterLabel]: STATUS.DEPLOYED,
      }));
      notify({
        message: 'Adapter ' + response.adapterStatus.toLowerCase(),
        event_type: EVENT_TYPES.SUCCESS,
      });
    }, variables);
  };

  const handleAdapterUndeploy = () => {
    if (!meshLocationURL || !meshLocationURL.value || meshLocationURL.value === '') {
      setMeshLocationURLError(true);
      return;
    }

    updateProgress({ showProgress: true });

    const targetPort = (() => {
      if (!meshLocationURL.value) {
        return null;
      }

      if (meshLocationURL.value.includes(':')) {
        return meshLocationURL.value.split(':')[1];
      }

      return meshLocationURL.value;
    })();

    const adapterName = (() => {
      if (!meshLocationURL.value) {
        return null;
      }

      if (meshLocationURL.value.includes(':')) {
        return meshLocationURL.value.split(':')[0];
      }

      return meshLocationURL.value;
    })();

    const adapterLabel = (
      availableAdapters.find((adapter) => adapter.value === targetPort)?.label || ''
    )
      .replace(/^meshery-/, '')
      .toUpperCase();

    setAdapterStates((prevState) => ({
      ...prevState,
      [adapterLabel]: STATUS.UNDEPLOYING,
    }));

    const variables = {
      status: 'DISABLED',
      adapter: adapterName,
      targetPort: targetPort,
    };

    changeAdapterState((response, errors) => {
      updateProgress({ showProgress: false });

      if (errors !== undefined) {
        console.error(errors);
        handleError('Unable to Deploy adapter');
        setAdapterStates((prevState) => ({
          ...prevState,
          [adapterLabel]: STATUS.DEPLOYED,
        }));
      }

      notify({
        message: 'Adapter ' + response.adapterStatus.toLowerCase(),
        event_type: EVENT_TYPES.SUCCESS,
      });

      setAdapterStates((prevState) => ({
        ...prevState,
        [adapterLabel]: STATUS.UNDEPLOYED,
      }));
    }, variables);
  };

  const handleError = (msg) => (error) => {
    updateProgress({ showProgress: false });
    notify({ message: msg, event_type: EVENT_TYPES.ERROR, details: error.toString() });
  };

  const configureTemplate = () => {
    let showAdapters = '';
    if (meshAdapters.length > 0) {
      showAdapters = (
        <AlignRight>
          {meshAdapters.map((adapter) => {
            let image = '/static/img/meshery-logo.png';
            if (adapter.name) {
              image = '/static/img/' + adapter.name.toLowerCase() + '.svg';
            }

            return (
              <Tooltip
                key={adapter.uniqueID}
                title={`Meshery Adapter for
                        ${adapter.name
                          .toLowerCase()
                          .split(' ')
                          .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                          .join(' ')} (${adapter.version})`}
              >
                <AdapterChipStyled
                  label={adapter.adapter_location}
                  onDelete={handleDelete(adapter.adapter_location)}
                  onClick={handleClick(adapter.adapter_location)}
                  icon={
                    // logoIcon
                    <BadgeAvatars color={getStatusColor(adapterStates[adapter.name])}>
                      <Avatar alt={adapter.name} src={image} style={iconMedium} />
                    </BadgeAvatars>
                  }
                  variant="outlined"
                  data-cy="chipAdapterLocation"
                />
              </Tooltip>
            );
          })}
        </AlignRight>
      );
    }

    return (
      <NoSsr>
        <WrapperStyledDiv data-cy="mesh-adapter-connections">
          {showAdapters}

          <Grid2 container spacing={1} alignItems="flex-end" size="grow">
            <Grid2 data-cy="mesh-adapter-url" size={{ xs: 12 }}>
              <ReactSelectWrapper
                onChange={handleMeshLocURLChange}
                options={setAdapterURLs}
                value={meshLocationURL}
                // placeholder={'Mesh Adapter URL'}
                label="Mesh Adapter URL"
                error={meshLocationURLError}
              />
            </Grid2>
          </Grid2>
          <React.Fragment>
            <AdapterButtons>
              <AdapterButton
                type="submit"
                variant="contained"
                data-testid="adapter-undeploy-button"
                color="primary"
                size="large"
                onClick={handleAdapterUndeploy}
                disabled={
                  !CAN(
                    keys.UNDEPLOY_CLOUD_NATIVE_INFRASTRUCTURE.action,
                    keys.UNDEPLOY_CLOUD_NATIVE_INFRASTRUCTURE.subject,
                  )
                }
              >
                Undeploy
              </AdapterButton>
              <AdapterButton
                type="submit"
                variant="contained"
                data-testid="adapter-connect-button"
                color="primary"
                size="large"
                onClick={handleSubmit}
                data-cy="btnSubmitMeshAdapter"
                disabled={!CAN(keys.CONNECT_ADAPTER.action, keys.CONNECT_ADAPTER.subject)}
              >
                Connect
              </AdapterButton>
            </AdapterButtons>
          </React.Fragment>
          <Grid2
            container
            spacing={1}
            alignItems="flex-end"
            style={{ marginTop: '50px' }}
            size="grow"
          >
            <Grid2 size={{ xs: 12 }}>
              <ReactSelectWrapper
                onChange={handleAvailableAdapterChange}
                options={availableAdapters}
                value={selectedAvailableAdapter}
                // placeholder={'Mesh Adapter URL'}
                label="Available Adapters"
                data-testid="adapters-available-label"
                error={selectedAvailableAdapterError}
              />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={1} alignItems="flex-end" justifyContent="flex-end" size="grow">
            <div ref={labelRef}>
              <TextField
                id="deployPort"
                type="text"
                label="Enter Port"
                variant="standard"
                onChange={(e) => handleDeployPortChange(e.target)}
                value={meshDeployURL}
                error={meshDeployURLError}
              />
            </div>
            <React.Fragment>
              <AdapterButtons>
                <AdapterButton
                  type="submit"
                  variant="contained"
                  data-testid="adapter-deploy-button"
                  color="primary"
                  size="large"
                  onClick={handleAdapterDeploy}
                  disabled={
                    !CAN(
                      keys.DEPLOY_CLOUD_NATIVE_INFRASTRUCTURE.action,
                      keys.DEPLOY_CLOUD_NATIVE_INFRASTRUCTURE.subject,
                    )
                  }
                >
                  Deploy
                </AdapterButton>
              </AdapterButtons>
            </React.Fragment>
          </Grid2>
        </WrapperStyledDiv>
      </NoSsr>
    );
  };

  return configureTemplate();
};

export default MeshAdapterConfigComponent;
