const config = {
  SOCKET_EVENTS: {
    CREATE_BOARD: "create-board",
    JOIN_BOARD: "join-board",
    LEAVE_BOARD: "leave-board",
    DRAW_START: "draw-start",
    DRAW_MOVE: "draw-move",
    DRAW_END: "draw-end",
    ERASE: "erase",
    ADD_TEXT: "add-text",
    ADD_SHAPE: "add-shape",
    MODIFY_OBJECT: "modify-object",
    DELETE_OBJECT: "delete-object",
    CLEAR_BOARD: "clear-board",
    CURSOR_MOVE: "cursor-move",
    SAVE_BOARD: "save-board",

    BOARD_CREATED: "board-created",
    BOARD_JOINED: "board-joined",
    BOARD_STATE: "board-state",
    USER_JOINED: "user-joined",
    USER_LEFT: "user-left",
    REMOTE_DRAW: "remote-draw",
    REMOTE_ERASE: "remote-erase",
    REMOTE_ADD: "remote-add",
    REMOTE_MODIFY: "remote-modify",
    REMOTE_DELETE: "remote-delete",
    BOARD_CLEARED: "board-cleared",
    CURSOR_UPDATE: "cursor-update",
    BOARD_SAVED: "board-saved",
    ERROR: "error",
  },

  TOOLS: {
    PEN: "pen",
    ERASER: "eraser",
    TEXT: "text",
    RECTANGLE: "rectangle",
    CIRCLE: "circle",
    LINE: "line",
    SELECT: "select",
  },

  DEFAULTS: {
    STROKE_WIDTH: 2,
    STROKE_COLOR: "#000000",
    FILL_COLOR: "transparent",
    FONT_SIZE: 16,
    FONT_FAMILY: "Arial",
    CANVAS_WIDTH: 1920,
    CANVAS_HEIGHT: 1080,
  },

  BOARD: {
    MAX_TITLE_LENGTH: 100,
    AUTO_SAVE_INTERVAL: 5 * 60 * 1000,
    CLEANUP_DAYS: 30,
    MAX_OBJECTS: 10000,
  },

  USER: {
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 30,
    MIN_PASSWORD_LENGTH: 6,
  },

  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 100,
  },

  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },

  ERRORS: {
    BOARD_NOT_FOUND: "Board not found",
    USER_NOT_FOUND: "User not found",
    UNAUTHORIZED: "Not authorized",
    INVALID_CREDENTIALS: "Invalid credentials",
    VALIDATION_ERROR: "Validation error",
    INTERNAL_ERROR: "Internal server error",
  },
};

export default config;
