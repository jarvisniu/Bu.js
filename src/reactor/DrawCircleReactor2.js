/**
 * Draw circle by dragging the diameter
 */

Geom2D.DrawCircleReactor2 = function (renderer) {

    // variables
    var mousePosDown = new Geom2D.Point();
    var mousePos = new Geom2D.Point();
    var buttonDown = false;

    var circle, line;

    // API
    this.enabled = false;

    this.enable = function () {
        addListeners();
        this.enabled = true;
    };

    this.disable = function () {
        removeListeners();
        this.enabled = false;
    };

    // functions
    function addListeners() {
        renderer.dom.addEventListener("mousedown", onMouseDown);
        renderer.dom.addEventListener("mousemove", onMouseMove);
        renderer.dom.addEventListener("mouseup", onMouseUp);
    }

    function removeListeners() {
        renderer.dom.removeEventListener("mousedown", onMouseDown);
        renderer.dom.removeEventListener("mousemove", onMouseMove);
        renderer.dom.removeEventListener("mouseup", onMouseUp);
    }

    function onMouseDown(e) {
        // add
        mousePosDown.set(e.offsetX, e.offsetY);

        circle = new Geom2D.Circle(mousePosDown.x, mousePosDown.y, 1);
        renderer.append(circle);

        line = new Geom2D.Line(mousePosDown.x, mousePosDown.y, mousePosDown.x, mousePosDown.y);
        line.stroke("#f44");
        renderer.append(line);

        buttonDown = true;
    }

    function onMouseMove(e) {
        // change radius
        if (buttonDown) {
            mousePos.set(e.offsetX, e.offsetY);
            circle.radius = mousePos.distanceTo(mousePosDown) / 2;
            line.setPoint2(mousePos);
            circle.setCenter(line.midpoint);
        }
    }

    function onMouseUp(e) {
        buttonDown = false;
    }

};