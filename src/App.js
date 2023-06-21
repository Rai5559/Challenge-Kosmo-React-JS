import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";
import saveUrl from "./randomPhoto";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [url, setUrl] = useState(null);

  //function to get a random url and set it to the state
  async function setNewUrl() {
    const url = await saveUrl();
    setUrl(url);
  }
  //useEffect to set the initial url
  useEffect(() => {
    setNewUrl();
  }, []);

  const addMoveable = async () => {
    // Get a random url from the API
    await setNewUrl();
    // Create a new moveable component and add it to the array

    // fit options for the image
    const fit = ["contain", "cover", "fill", "none", "scale-down"];

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        // Get a random fit option
        fit: fit[Math.floor(Math.random() * fit.length)],
        color: url,
        updateEnd: true,
      },
    ]);
  };

  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  const handleResizeStart = (index, e) => {
    console.log("e", e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      console.log("width", moveableComponents, e);
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  return (
    <main style={{ height: "100vh", width: "100vw" }}>
      <button onClick={addMoveable}>Add Moveable1</button>
      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  fit,
  color,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    fit,
    color,
    id,
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();

  const onResize = async (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height) {
      newHeight = parentBounds?.height - top;
    }
    if (positionMaxLeft > parentBounds?.width) {
      newWidth = parentBounds?.width - left;
    }

    const translateX = e.drag.beforeTranslate[0];
    const translateY = e.drag.beforeTranslate[1];

    ref.current.style.width = `${newWidth}px`;
    ref.current.style.height = `${newHeight}px`;
    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia((prev) => ({
      ...prev,
      translateX,
      translateY,
      width: newWidth,
      height: newHeight,
      top: top + translateY < 0 ? -translateY : top,
      left: left + translateX < 0 ? -translateX : left,
    }));
  };

  const onResizeEnd = async (e) => {
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height) {
      newHeight = parentBounds?.height - top;
    }
    if (positionMaxLeft > parentBounds?.width) {
      newWidth = parentBounds?.width - left;
    }

    const absoluteTop = top + e.drag.beforeTranslate[1];
    const absoluteLeft = left + e.drag.beforeTranslate[0];

    updateMoveable(
      id,
      {
        top: absoluteTop,
        left: absoluteLeft,
        width: newWidth,
        height: newHeight,
        fit,
        color,
      },
      true
    );
  };

  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          objectFit: fit,
          backgroundImage: `url(${color})`,
        }}
        onClick={() => setSelected(id)}
      />

      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={(e) => {
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            fit,
            color,
          });
        }}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};
