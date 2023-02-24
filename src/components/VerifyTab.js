import React, { useState } from "react";
import { withTaskContext } from "@twilio/flex-ui";
import AutorenewIcon from "@material-ui/icons/Autorenew";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import axios from "axios";
import {
  Input,
  Heading,
  Button,
  Paragraph,
  Card,
  Combobox,
} from "@twilio-paste/core";

const classes = {
  container: {
    flexGrow: 1,
    margin: "10px",
  },
  card: {
    margin: "2px",
  },
  headingArea: {
    alignItems: "center",
    justifyContent: "center",
  },
  inputArea: {
    display: "flex",
    flexDirecton: "row",
    alignItems: "space-between",
    justifyContent: "space-between",
    margin: "5px",
  },
  pendingArea: {
    display: "flex",
    flexDirecton: "row",
    alignItems: "space-around",
    justifyContent: "space-around",
    margin: "5px",
    width: "75%",
  },
  input: {
    width: "60%",
  },
  sendArea: {
    marginTop: "30px",
  },
};
const verifyMethods = [
  { label: "SMS", channel: "sms" },
  { label: "Voice", channel: "call" },
];

const getVerifyMethods = (task) => {
  let methods = [];

  if (task.attributes.email) methods.push({ label: "Email", channel: "email" });

  if (task.attributes.phone) methods.push({ label: "Voice", channel: "call" });

  if (task.attributes.phone) methods.push({ label: "SMS", channel: "sms" });

  return methods;
};

const getVerifyAddress = (channel, task) => {
  switch (channel) {
    case "email":
      return task.attributes.email;
    case "web":
      return task.attributes.email;
    case "voice":
      return task.attributes.caller || task.attributes.phone;
    case "call":
      return task.attributes.caller || task.attributes.phone;
    case "sms":
      return task.attributes.caller || task.attributes.phone;
    default:
      return null;
  }
};

function VerifyTab(props) {
  const { task } = props;

  const [verified, setVerified] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState(false);
  const [verifyMethod, setVerifyMethod] = useState(null);

  const handleChange = (event) => {
    setVerifyCode(event.target.value);
  };

  const checkVerify = async () => {
    setPending(true);

    try {
      const to = getVerifyAddress(verifyMethod.channel, task);
      const response = await axios.post(
        `${process.env.REACT_APP_SERVICE_BASE_URL}/check-verify`,
        {
          to: to,
          verification_code: verifyCode,
        }
      );
      console.log(response.data);
      if (!response.data.success) {
        setPending(false);
        setFailure(true);
      } else {
        setPending(false);
        setVerified(true);
      }
    } catch (error) {
      setPending(false);
      setFailure(true);
    }
  };

  const sendVerify = async () => {
    //your runtime domain goes below
    if (verifyMethod) {
      const to = getVerifyAddress(verifyMethod.channel, task);
      const response = await axios.post(
        `${process.env.REACT_APP_SERVICE_BASE_URL}/start-verify`,
        {
          to: to,
          channel: verifyMethod.channel,
        }
      );
      setSent(true);
      setCounter(30);
      console.log(response.data);
    } else {
      alert("Please select a verify method");
    }
  };

  const [counter, setCounter] = React.useState(0);

  React.useEffect(() => {
    counter > 0 && setTimeout(() => setCounter(counter - 1), 1000);
  }, [counter]);

  const resetVerify = async () => {
    setPending(false);
    setSent(false);
    setFailure(false);
    setVerified(false);
    console.log("Reset verify");
  };

  return (
    <div style={classes.container}>
      <Card style={classes.container}>
        <div style={classes.headingArea}>
          <Heading as="h2" variant="heading20">
            Multi-Factor Authentication
          </Heading>
          <Paragraph>
            Send a Twilio Verify message to to the caller to verify their
            identity.
          </Paragraph>
        </div>
        {failure ? (
          <div style={classes.failure}>
            <Paragraph>Verification failed. Please try again.</Paragraph>
          </div>
        ) : null}
        {sent && !pending && !verified ? (
          <>
            <div style={classes.inputArea}>
              <div style={classes.input}>
                <Input
                  type="text"
                  name="verify-code-input"
                  id="verify-code-input"
                  placeholder="Enter verification code"
                  value={verifyCode}
                  onChange={() => handleChange(event)}
                ></Input>
              </div>

              <Button variant="destructive" onClick={() => checkVerify()}>
                Check Code
              </Button>
            </div>
            <div style={classes.inputArea}>
              <div style={classes.input}>
                Request new code
                {counter > 0 && " in " + counter}
              </div>
              <Button
                variant="secondary"
                disabled={counter > 0}
                onClick={() => resetVerify()}
              >
                Reset
              </Button>
            </div>
          </>
        ) : null}
        {!sent && !pending && !verified ? (
          <div style={classes.sendArea}>
            <Combobox
              items={getVerifyMethods(task)}
              labelText="Select a channel"
              required
              optionTemplate={(item) => <div>{item.label}</div>}
              itemToString={(item) => (item ? item.label : null)}
              onSelectedItemChange={(item) =>
                setVerifyMethod(item.selectedItem)
              }
            />
            <br />
            <Button variant="primary" onClick={() => sendVerify()}>
              Send verification
            </Button>
          </div>
        ) : null}
        {pending ? (
          <div style={classes.pendingArea}>
            <AutorenewIcon color="primary" fontSize="large" />
            <Heading as="h5" variant="heading50">
              Verifying Customer...
            </Heading>
          </div>
        ) : null}
        {verified ? (
          <div style={classes.pendingArea}>
            <CheckCircleIcon color="primary" fontSize="large" />
            <Heading as="h5" variant="heading50">
              Verified Successfully!
            </Heading>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

export default withTaskContext(VerifyTab);
