// In your game object file at some point during initialization
const eyePlaygraph = {
  
  see: {
    "200": {
      "graph": [
        "game1/clips/see-200_to_188-graph.webm",
        "game1/clips/see-200_to_178-graph.webm",
        "game1/clips/see-200_to_168-graph.webm"
      ],
      "sink": {
        "lamp-sink": "game1/clips/see-200_to_lamp-sink.webm"
      }
    },
    "188": {
      "graph": [
        "game1/clips/see-188_to_200-graph.webm",
        "game1/clips/see-188_to_178-graph.webm",
        "game1/clips/see-188_to_168-graph.webm"
      ],
      "sink": {

      }
    },
    "178": {
      "graph": [
        "game1/clips/see-178_to_200-graph.webm",
        "game1/clips/see-178_to_188-graph.webm",
        "game1/clips/see-178_to_168-graph.webm"
      ],
      "sink": {

      }
    },
    "168": {
      "graph": [
        "game1/clips/see-168_to_200-graph.webm",
        "game1/clips/see-168_to_188-graph.webm",
        "game1/clips/see-168_to_178-graph.webm"
      ],
      "sink": {

      }
    },
  },
  se: {
    "79": {
      "graph": [
        "game1/clips/see-79_to_73-graph.webm",
        "game1/clips/see-79_to_67-graph.webm",
        "game1/clips/see-79_to_62-graph.webm"
      ],
      "sink": {

      }
    },
    "73": {
      "graph": [
        "game1/clips/see-73_to_79-graph.webm",
        "game1/clips/see-73_to_67-graph.webm",
        "game1/clips/see-73_to_62-graph.webm"
      ],
      "sink": {

      }
    },
    "67": {
      "graph": [
        "game1/clips/see-67_to_79-graph.webm",
        "game1/clips/see-67_to_73-graph.webm",
        "game1/clips/see-67_to_62-graph.webm"
      ],
      "sink": {

      }
    },
    "62": {
      "graph": [
        "game1/clips/see-62_to_79-graph.webm",
        "game1/clips/see-62_to_73-graph.webm",
        "game1/clips/see-62_to_67-graph.webm"
      ],
      "sink": {
        "168-sink": "game1/clips/see-62_to_168-sink.webm"
      }
    },
  },
  s: {
    "21": {
      "graph": [
        "game1/clips/see-21_to_17-graph.webm",
        "game1/clips/see-21_to_10-graph.webm",
        "game1/clips/see-21_to_6-graph.webm"
      ],
      "sink": {
        "62-sink": "game1/clips/see-21_to_62-sink.webm"
      }
    },
    "17": {
      "graph": [
        "game1/clips/see-17_to_21-graph.webm",
        "game1/clips/see-17_to_10-graph.webm",
        "game1/clips/see-17_to_6-graph.webm"
      ],
      "sink": {

      }
    },
    "10": {
      "graph": [
        "game1/clips/see-10_to_21-graph.webm",
        "game1/clips/see-10_to_17-graph.webm",
        "game1/clips/see-10_to_6-graph.webm"
      ],
      "sink": {

      }
    },
    "6": {
      "graph": [
        "game1/clips/see-6_to_21-graph.webm",
        "game1/clips/see-6_to_17-graph.webm",
        "game1/clips/see-6_to_10-graph.webm"
      ],
      "sink": {

      }
    },
    "see": {
      "graph": [

      ],
      "sink": {
        "intro-sink": "game1/clips/see_intro-sink.webm"
      }
    }
  },
  lamp_intro: "game1/clips/lamp_intro_to_487-sink.webm",
  lamp: {
    "536": {
      "graph": [
        "game1/clips/lamp-536_to_522-graph.webm",
        "game1/clips/lamp-536_to_502-graph.webm",
        "game1/clips/lamp-536_to_487-graph.webm"
      ],
      "sink": {
      }
    },
    "522": {
      "graph": [
        "game1/clips/lamp-522_to_536-graph.webm",
        "game1/clips/lamp-522_to_502-graph.webm",
        "game1/clips/lamp-522_to_487-graph.webm"
      ],
      "sink": {
      }
    },
    "502": {
      "graph": [
        "game1/clips/lamp-502_to_536-graph.webm",
        "game1/clips/lamp-502_to_522-graph.webm",
        "game1/clips/lamp-502_to_487-graph.webm"
      ],
      "sink": {
      }
    },
    "487": {
      "graph": [
        "game1/clips/lamp-487_to_536-graph.webm",
        "game1/clips/lamp-487_to_522-graph.webm",
        "game1/clips/lamp-487_to_502-graph.webm"
      ],
      "sink": {
      }
    },
  }
}

module.exports = {
  // export default {
  blank: 'main/blank.webm',
  intro: {
    eyePlaygraph,
  }
}