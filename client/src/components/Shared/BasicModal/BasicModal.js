import React from "react";
import { Modal } from "semantic-ui-react";

export function BasicModal(props) {
  const { show, close, title, size, children } = props;

  const sizeValue=size? size : "tiny";

  return (
    <Modal closeIcon open={show} onClose={close} size={sizeValue}>
      {title && <Modal.Header>{title}</Modal.Header>}
      <Modal.Content>{children}</Modal.Content>
    </Modal>
  );
}

// BasicModal.defaultProps = {
//   size: "tiny",
// };
