const eyePlaygraph = {
  s: {
    "65": {
      "graph": [
        "game1/clips/see-65_to_57-graph.webm",
        "game1/clips/see-65_to_52-graph.webm",
        "game1/clips/see-65_to_46-graph.webm",
        "game1/clips/see-65_to_61-graph.webm"
      ],
      "sink": {
        "123-sink": "game1/clips/see-65_to_123-sink.webm"
      }
    },
    "61": {
      "graph": [
        "game1/clips/see-61_to_57-graph.webm",
        "game1/clips/see-61_to_52-graph.webm",
        "game1/clips/see-61_to_46-graph.webm",
        "game1/clips/see-61_to_65-graph.webm"
      ],
      "sink": {

      }
    },
    "57": {
      "graph": [
        "game1/clips/see-57_to_65-graph.webm",
        "game1/clips/see-57_to_61-graph.webm",
        "game1/clips/see-57_to_52-graph.webm",
        "game1/clips/see-57_to_46-graph.webm"
      ],
      "sink": {

      }
    },
    "52": {
      "graph": [
        "game1/clips/see-52_to_65-graph.webm",
        "game1/clips/see-52_to_61-graph.webm",
        "game1/clips/see-52_to_57-graph.webm",
        "game1/clips/see-52_to_46-graph.webm"
      ],
      "sink": {

      }
    },
    "46": {
      "graph": [
        "game1/clips/see-46_to_65-graph.webm",
        "game1/clips/see-46_to_61-graph.webm",
        "game1/clips/see-46_to_57-graph.webm",
        "game1/clips/see-46_to_52-graph.webm"
      ],
      "sink": {

      }
    }
  },
  se: {
    "125": {
      "graph": [
        "game1/clips/see-125_to_123-graph.webm",
        "game1/clips/see-125_to_120-graph.webm",
        "game1/clips/see-125_to_118-graph.webm"
      ],
      "sink": {
        "164-sink": "game1/clips/see_125_to_164-sink.webm"
      }
    },
    "123": {
      "graph": [
        "game1/clips/see-123_to_125-graph.webm",
        "game1/clips/see-123_to_120-graph.webm",
        "game1/clips/see-123_to_118-graph.webm"
      ],
      "sink": {
      }
    },
    "120": {
      "graph": [
        "game1/clips/see-120_to_125-graph.webm",
        "game1/clips/see-120_to_123-graph.webm",
        "game1/clips/see-120_to_118-graph.webm"
      ],
      "sink": {

      }
    },
    "118": {
      "graph": [
        "game1/clips/see-118_to_125-graph.webm",
        "game1/clips/see-118_to_123-graph.webm",
        "game1/clips/see-118_to_120-graph.webm"
      ],
      "sink": {

      }
    }
  },

  see: {
    "200": {
      "graph": [
        "game1/clips/see-200_to_164-graph.webm"
      ],
      "sink": {
        "200-sink": "game1/clips/see_200_to_lamp-sink.webm"
      }
    },
    "186": {
      "graph": [
        "game1/clips/see-186_to_200-graph.webm",
        "game1/clips/see-186_to_175-graph.webm",
        "game1/clips/see-186_to_167-graph.webm",
        "game1/clips/see-186_to_164-graph.webm"
      ],
      // todo: in 'sink' mode we should automatically pick 'sink' and it should contain
      // a link to the nearest sink
      "sink": {

      }
    },
    "175": {
      "graph": [
        "game1/clips/see-175_to_200-graph.webm",
        "game1/clips/see-175_to_186-graph.webm",
        "game1/clips/see-175_to_167-graph.webm",
        "game1/clips/see-175_to_164-graph.webm"
      ],
      "sink": {

      }
    },
    "167": {
      "graph": [
        "game1/clips/see-167_to_200-graph.webm",
        "game1/clips/see-167_to_186-graph.webm",
        "game1/clips/see-167_to_175-graph.webm",
        "game1/clips/see-167_to_164-graph.webm"
      ],
      "sink": {

      }
    },
    "164": {
      "graph": [
        "game1/clips/see-164_to_200-graph.webm",
        "game1/clips/see-164_to_186-graph.webm",
        "game1/clips/see-164_to_175-graph.webm",
        "game1/clips/see-164_to_167-graph.webm"
      ],
      "sink": {

      }
    },
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
};

export default {
  blank: 'main/blank.webm',
  intro: {
    eyePlaygraph,
  }
}