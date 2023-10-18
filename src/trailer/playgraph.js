window.Playgraph = {
  playgraphs: {
    one: [
      {
        ping: {
          nodes: [
            {
              edges: [],
              id: "e:/emulsion_workspace/ping/frames/img_0038.png",
              label: "img_0038.png",
              name: "e:/emulsion_workspace/ping/frames/img_0038.png",
            },
            {
              edges: [
                {
                  destination: "e:/emulsion_workspace/ping/frames/img_0038.png",
                  from: "e:/emulsion_workspace/ping/frames/img_0026.png",
                  fromPath: "/file/ping/frames/img_0026.png",
                  id: "26_thru_38.webm",
                  path: "/file/ping/output/26_thru_38.webm",
                  to: "e:/emulsion_workspace/ping/frames/img_0038.png",
                  toPath: "/file/ping/frames/img_0038.png",
                },
              ],
              id: "e:/emulsion_workspace/ping/frames/img_0026.png",
              label: "img_0026.png",
              name: "e:/emulsion_workspace/ping/frames/img_0026.png",
            },
            {
              edges: [
                {
                  destination: "e:/emulsion_workspace/ping/frames/img_0018.png",
                  from: "e:/emulsion_workspace/ping/frames/img_0020.png",
                  fromPath: "/file/ping/frames/img_0020.png",
                  id: "img_0020_to_img_0018.webm",
                  path: "/file/ping/tweens/img_0020_to_img_0018.webm",
                  tags: ["to_src", "idle"],
                  to: "e:/emulsion_workspace/ping/frames/img_0018.png",
                  toPath: "/file/ping/frames/img_0018.png",
                },
              ],
              id: "e:/emulsion_workspace/ping/frames/img_0020.png",
              label: "img_0020.png",
              name: "e:/emulsion_workspace/ping/frames/img_0020.png",
            },
            {
              edges: [
                {
                  destination: "e:/emulsion_workspace/ping/frames/img_0026.png",
                  from: "e:/emulsion_workspace/ping/frames/img_0018.png",
                  fromPath: "/file/ping/frames/img_0018.png",
                  id: "18_thru_26.webm",
                  path: "/file/ping/output/18_thru_26.webm",
                  to: "e:/emulsion_workspace/ping/frames/img_0026.png",
                  toPath: "/file/ping/frames/img_0026.png",
                },
                {
                  destination: "e:/emulsion_workspace/ping/frames/img_0018.png",
                  from: "e:/emulsion_workspace/ping/frames/img_0018.png",
                  fromPath: "/file/ping/frames/img_0018.png",
                  id: "18_thru_18.webm",
                  path: "/file/ping/output/18_thru_18.webm",
                  tags: ["next"],
                  to: "e:/emulsion_workspace/ping/frames/img_0018.png",
                  toPath: "/file/ping/frames/img_0018.png",
                },
                {
                  destination: "e:/emulsion_workspace/ping/frames/img_0020.png",
                  from: "e:/emulsion_workspace/ping/frames/img_0018.png",
                  fromPath: "/file/ping/frames/img_0018.png",
                  id: "img_0018_to_img_0020.webm",
                  path: "/file/ping/tweens/img_0018_to_img_0020.webm",
                  tags: ["from_src", "idle"],
                  to: "e:/emulsion_workspace/ping/frames/img_0020.png",
                  toPath: "/file/ping/frames/img_0020.png",
                },
              ],
              id: "e:/emulsion_workspace/ping/frames/img_0018.png",
              label: "img_0018.png",
              name: "e:/emulsion_workspace/ping/frames/img_0018.png",
            },
            {
              edges: [
                {
                  destination: "e:/emulsion_workspace/ping/frames/img_0018.png",
                  from: "e:/emulsion_workspace/ping/frames/img_0012.png",
                  fromPath: "/file/ping/frames/img_0012.png",
                  id: "12_thru_18.webm",
                  path: "/file/ping/output/12_thru_18.webm",
                  to: "e:/emulsion_workspace/ping/frames/img_0018.png",
                  toPath: "/file/ping/frames/img_0018.png",
                },
                {
                  destination: "e:/emulsion_workspace/ping/frames/img_0012.png",
                  from: "e:/emulsion_workspace/ping/frames/img_0012.png",
                  fromPath: "/file/ping/frames/img_0012.png",
                  id: "img_0012_to_img_0012.webm",
                  path: "/file/ping/tweens/img_0012_to_img_0012.webm",
                  to: "e:/emulsion_workspace/ping/frames/img_0012.png",
                  toPath: "/file/ping/frames/img_0012.png",
                },
              ],
              id: "e:/emulsion_workspace/ping/frames/img_0012.png",
              label: "img_0012.png",
              name: "e:/emulsion_workspace/ping/frames/img_0012.png",
            },
            {
              edges: [
                {
                  destination: "e:/emulsion_workspace/ping/frames/img_0012.png",
                  from: "e:/emulsion_workspace/ping/frames/img_0001.png",
                  fromPath: "/file/ping/frames/img_0001.png",
                  id: "1_thru_12.webm",
                  path: "/file/ping/output/1_thru_12.webm",
                  to: "e:/emulsion_workspace/ping/frames/img_0012.png",
                  toPath: "/file/ping/frames/img_0012.png",
                },
              ],
              id: "e:/emulsion_workspace/ping/frames/img_0001.png",
              label: "img_0001.png",
              name: "e:/emulsion_workspace/ping/frames/img_0001.png",
            },
          ],
        },
        cursor: {
          nodes: [
            // blank
            {
              id: "blank",
              label: "blank",
              name: "blank.webm",
              edges: [
                {
                  from: "blank",
                  to: "l",
                  id: "l.webm",
                  path: "nextpath",
                  tags: ["next"],
                },
              ],
            },
            // flower hover test
            {
              id: "flower_enter",
              label: "flower_enter",
              name: "flower_enter3.webm",
              edges: [
                {
                  from: "blank",
                  to: "l",
                  id: "l.webm",
                  path: "nextpath",
                  tags: ["next"],
                },
              ],
            },
            {
              id: "flower_reverse",
              label: "flower_reverse",
              name: "flower_reverse3.webm",
              edges: [
                {
                  from: "blank",
                  to: "l",
                  id: "l.webm",
                  path: "nextpath",
                  tags: ["next"],
                },
              ],
            },
// look
            {
              id: "l",
              label: "l",
              name: "l.webm",
              edges: [
                  {
                      from: "l",
                      to: "l_idle",
                      id: "l_idle.webm",
                      path: "nextpath",
                      tags: ["next"],
                  },
              ],
          },
          {
              id: "l_idle",
              label: "l_idle",
              name: "l_idle.webm",
              edges: [
                  {
                      from: "l_idle",
                      to: "l_idle",
                      id: "l_idle.webm",
                      path: "nextpath",
                      tags: ["idle"],
                  },
              ],
          },
          {
              id: "lo",
              label: "lo",
              name: "lo.webm",
              edges: [
                  {
                      from: "lo",
                      to: "lo_idle",
                      id: "lo_idle.webm",
                      path: "nextpath",
                      tags: ["next"],
                  },
              ],
          },
          {
              id: "lo_idle",
              label: "lo_idle",
              name: "lo_idle.webm",
              edges: [
                  {
                      from: "lo_idle",
                      to: "lo_idle",
                      id: "lo_idle.webm",
                      path: "nextpath",
                      tags: ["idle"],
                  },
              ],
          },
          {
            id: "loo",
            label: "loo",
            name: "loo.webm",
            edges: [
                {
                    from: "loo",
                    to: "loo",
                    id: "loo.webm",
                    path: "nextpath",
                    tags: ["idle"],
                },
            ],
          },
        {
          id: "loo_idle",
          label: "loo_idle",
          name: "loo_idle.webm",
          edges: [
              {
                  from: "loo_idle",
                  to: "loo_idle",
                  id: "loo_idle.webm",
                  path: "nextpath",
                  tags: ["idle"],
              },
          ],
        },
        {
          id: "look",
          label: "look",
          name: "look.webm",
          edges: [
              {
                  from: "look",
                  to: "look",
                  id: "look.webm",
                  path: "nextpath",
                  tags: ["idle"],
              },
          ],
        },
        {
      id: "look_idle",
      label: "look_idle",
      name: "look_idle.webm",
      edges: [
          {
              from: "look_idle",
              to: "look_idle",
              id: "look_idle.webm",
              path: "nextpath",
              tags: ["idle"],
          },
      ],
    },
    // lantern handle text
          {
            id: "look_at_handle_enter",
            label: "look_at_handle_enter",
            name: "look_at_handle_enter.webm",
            edges: [
              {
                from: "look_at_handle_enter",
                to: "look_at_handle_idle",
                id: "look_at_handle_idle.webm",
                path: "nextpath",
                tags: ["next"],
              },
            ],
          },
          {
            id: "look_at_handle_idle",
            label: "look_at_handle_idle",
            name: "look_at_handle_idle.webm",
            edges: [
              {
                from: "look_at_handle_idle",
                to: "look_at_handle_idle",
                id: "look_at_handle_idle.webm",
                path: "nextpath",
                tags: ["idle"], // loop to itself
              },
              {
                from: "look_at_handle_idle",
                to: "look_at_handle_exit",
                id: "look_at_handle_exit.webm",
                path: "nextpath",
                tags: ["exit"], 
              },
            ],
          },
          {
            id: "look_at_handle_exit",
            label: "look_at_handle_exit",
            name: "look_at_handle_exit.webm",
            edges: [],  // Assuming it doesn't transition to anything further from here.
          },
      // open cursor
      {
        id: "o",
        label: "o",
        name: "o.webm",
        edges: [],  // Assuming it doesn't transition to anything further from here.
      },
      {
        id: "o_idle",
        label: "o_idle",
        name: "o_idle.webm",
        edges: [],  // Assuming it doesn't transition to anything further from here.
      },
      {
        id: "op",
        label: "op",
        name: "op.webm",
        edges: [],  // Assuming it doesn't transition to anything further from here.
      },
      {
        id: "op_idle",
        label: "op_idle",
        name: "op_idle.webm",
        edges: [],  // Assuming it doesn't transition to anything further from here.
      },
      {
        id: "ope",
        label: "ope",
        name: "ope.webm",
        edges: [],  // Assuming it doesn't transition to anything further from here.
      },
      {
        id: "ope_idle",
        label: "ope_idle",
        name: "ope_idle.webm",
        edges: [],  // Assuming it doesn't transition to anything further from here.
      },
      {
        id: "open",
        label: "open",
        name: "open.webm",
        edges: [],  // Assuming it doesn't transition to anything further from here.
      },
      {
        id: "open_idle",
        label: "open_idle",
        name: "open_idle.webm",
        edges: [],  // Assuming it doesn't transition to anything further from here.
      },
    ],
    edges: [
    ],
  },
  main: {
    nodes: [
      {
        edges: [
          {
            destination:
              "e:/emulsion_workspace/candidate_good/frames/img_2209.png",
            from: "e:/emulsion_workspace/candidate_good/frames/img_2211.png",
            fromPath: "/file/candidate_good/frames/img_2211.png",
            id: "img_2211_to_img_2209.webm",
            path: "/file/candidate_good/tweens/img_2211_to_img_2209.webm",
            to: "e:/emulsion_workspace/candidate_good/frames/img_2209.png",
            toPath: "/file/candidate_good/frames/img_2209.png",
          },
        ],
        id: "e:/emulsion_workspace/candidate_good/frames/img_2211.png",
        label: "img_2211.png",
        name: "e:/emulsion_workspace/candidate_good/frames/img_2211.png",
      },
      {
        edges: [
          {
            destination:
              "e:/emulsion_workspace/candidate_good/frames/img_2025.png",
            from: "e:/emulsion_workspace/candidate_good/frames/img_2027.png",
            fromPath: "/file/candidate_good/frames/img_2027.png",
            id: "img_2027_to_img_2025.webm",
            path: "/file/candidate_good/tweens/img_2027_to_img_2025.webm",
            to: "e:/emulsion_workspace/candidate_good/frames/img_2025.png",
            toPath: "/file/candidate_good/frames/img_2025.png",
          },
        ],
        id: "e:/emulsion_workspace/candidate_good/frames/img_2027.png",
        label: "img_2027.png",
        name: "e:/emulsion_workspace/candidate_good/frames/img_2027.png",
      },
      {
        edges: [
          {
            destination:
              "e:/emulsion_workspace/candidate_good/frames/img_1757.png",
            from: "e:/emulsion_workspace/candidate_good/frames/img_1759.png",
            fromPath: "/file/candidate_good/frames/img_1759.png",
            id: "img_1759_to_img_1757.webm",
            path: "/file/candidate_good/tweens/img_1759_to_img_1757.webm",
            to: "e:/emulsion_workspace/candidate_good/frames/img_1757.png",
            toPath: "/file/candidate_good/frames/img_1757.png",
          },
        ],
        id: "e:/emulsion_workspace/candidate_good/frames/img_1759.png",
        label: "img_1759.png",
        name: "e:/emulsion_workspace/candidate_good/frames/img_1759.png",
      },
      {
        edges: [
          {
            destination:
              "e:/emulsion_workspace/candidate_good/frames/img_1521.png",
            from: "e:/emulsion_workspace/candidate_good/frames/img_1523.png",
            fromPath: "/file/candidate_good/frames/img_1523.png",
            id: "img_1523_to_img_1521.webm",
            path: "/file/candidate_good/tweens/img_1523_to_img_1521.webm",
            to: "e:/emulsion_workspace/candidate_good/frames/img_1521.png",
            toPath: "/file/candidate_good/frames/img_1521.png",
          },
        ],
        id: "e:/emulsion_workspace/candidate_good/frames/img_1523.png",
        label: "img_1523.png",
        name: "e:/emulsion_workspace/candidate_good/frames/img_1523.png",
      },
      {
        edges: [
          {
            destination:
              "e:/emulsion_workspace/candidate_good/frames/img_1394.png",
            from: "e:/emulsion_workspace/candidate_good/frames/img_1408.png",
            fromPath: "/file/candidate_good/frames/img_1408.png",
            id: "img_1408_to_img_1394.webm",
            path: "/file/candidate_good/tweens/img_1408_to_img_1394.webm",
            to: "e:/emulsion_workspace/candidate_good/frames/img_1394.png",
            toPath: "/file/candidate_good/frames/img_1394.png",
          },
        ],
        id: "e:/emulsion_workspace/candidate_good/frames/img_1408.png",
        label: "img_1408.png",
        name: "e:/emulsion_workspace/candidate_good/frames/img_1408.png",
      },
      {
        edges: [
          {
            destination:
              "e:/emulsion_workspace/candidate_good/frames/img_1209.png",
            from: "e:/emulsion_workspace/candidate_good/frames/img_1221.png",
            fromPath: "/file/candidate_good/frames/img_1221.png",
            id: "img_1221_to_img_1209.webm",
            path: "/file/candidate_good/tweens/img_1221_to_img_1209.webm",
            tags: ["idle"],
            to: "e:/emulsion_workspace/candidate_good/frames/img_1209.png",
            toPath: "/file/candidate_good/frames/img_1209.png",
          },
        ],
        id: "e:/emulsion_workspace/candidate_good/frames/img_1221.png",
        label: "img_1221.png",
        name: "e:/emulsion_workspace/candidate_good/frames/img_1221.png",
      },
      {
        edges: [
          {
            destination:
              "e:/emulsion_workspace/candidate_good/frames/img_0537.png",
            from: "e:/emulsion_workspace/candidate_good/frames/img_0538.png",
            fromPath: "/file/candidate_good/frames/img_0538.png",
            id: "img_0538_to_img_0537.webm",
            path: "/file/candidate_good/tweens/img_0538_to_img_0537.webm",
            tags: ["idle"],
            to: "e:/emulsion_workspace/candidate_good/frames/img_0537.png",
            toPath: "/file/candidate_good/frames/img_0537.png",
          },
        ],
        id: "e:/emulsion_workspace/candidate_good/frames/img_0538.png",
        label: "img_0538.png",
        name: "e:/emulsion_workspace/candidate_good/frames/img_0538.png",
      },
      {
        edges: [
          {
            destination:
              "e:/emulsion_workspace/candidate_good/frames/img_0001.png",
            from: "e:/emulsion_workspace/candidate_good/frames/img_0004.png",
            fromPath: "/file/candidate_good/frames/img_0004.png",
            id: "img_0004_to_img_0001.webm",
            path: "/file/candidate_good/tweens/img_0004_to_img_0001.webm",
            tags: ["tag"],
            to: "e:/emulsion_workspace/candidate_good/frames/img_0001.png",
            toPath: "/file/candidate_good/frames/img_0001.png",
          },
        ],
        id: "e:/emulsion_workspace/candidate_good/frames/img_0004.png",
        label: "img_0004.png",
        name: "e:/emulsion_workspace/candidate_good/frames/img_0004.png",
      },
      {
        edges: [
          {
            destination:
              "e:/emulsion_workspace/candidate_good/frames/img_0281.png",
            from: "e:/emulsion_workspace/candidate_good/frames/img_0287.png",
            fromPath: "/file/candidate_good/frames/img_0287.png",
            id: "img_0287_to_img_0281.webm",
            path: "/file/candidate_good/tweens/img_0287_to_img_0281.webm",
            tags: ["tag"],
            to: "e:/emulsion_workspace/candidate_good/frames/img_0281.png",
            toPath: "/file/candidate_good/frames/img_0281.png",
          },
        ],
        mask: [{
          matchPixel(pixel) { return pixel[1] > 0; },
          name: 'handle'
        }],
        id: "e:/emulsion_workspace/candidate_good/frames/img_0287.png",
        label: "img_0287.png",
        name: "e:/emulsion_workspace/candidate_good/frames/img_0287.png",
      },
      {
        edges: [],
        id: "e:/emulsion_workspace/candidate_good/frames/img_2715.png",
        label: "img_2715.png",
        name: "e:/emulsion_workspace/candidate_good/frames/img_2715.png",
      },
      {
        edges: [
          {
            destination:
              "e:/emulsion_workspace/candidate_good/frames/img_2211.png",
            from: "e:/emulsion_workspace/candidate_good/frames/img_2209.png",
            fromPath: "/file/candidate_good/frames/img_2209.png",
            id: "img_2209_to_img_2211.webm",
            path: "/file/candidate_good/tweens/img_2209_to_img_2211.webm",
            to: "e:/emulsion_workspace/candidate_good/frames/img_2211.png",
            toPath: "/file/candidate_good/frames/img_2211.png",
          },
          {
            destination:
              "e:/emulsion_workspace/candidate_good/frames/img_2715.png",
            from: "e:/emulsion_workspace/candidate_good/frames/img_2209.png",
            fromPath: "/file/candidate_good/frames/img_2209.png",
            id: "2209_thru_2715.webm",
            path: "/file/candidate_good/output/2209_thru_2715.webm",
            to: "e:/emulsion_workspace/candidate_good/frames/img_2715.png",
            toPath: "/file/candidate_good/frames/img_2715.png",
          },
        ],
        id: "e:/emulsion_workspace/candidate_good/frames/img_2209.png",
        label: "img_2209.png",
        name: "e:/emulsion_workspace/candidate_good/frames/img_2209.png",
      },
      {
        edges: [
          {
            destination:
              "e:/emulsion_workspace/candidate_good/frames/img_2027.png",
            from: "e:/emulsion_workspace/candidate_good/frames/img_2025.png",
            fromPath: "/file/candidate_good/frames/img_2025.png",
            id: "img_2025_to_img_2027.webm",
            path: "/file/candidate_good/tweens/img_2025_to_img_2027.webm",
            to: "e:/emulsion_workspace/candidate_good/frames/img_2027.png",
            toPath: "/file/candidate_good/frames/img_2027.png",
          },
          {
            destination:
              "e:/emulsion_workspace/candidate_good/frames/img_2209.png",
            from: "e:/emulsion_workspace/candidate_good/frames/img_2025.png",
            fromPath: "/file/candidate_good/frames/img_2025.png",
            id: "2025_thru_2209.webm",
            path: "/file/candidate_good/output/2025_thru_2209.webm",
            to: "e:/emulsion_workspace/candidate_good/frames/img_2209.png",
            toPath: "/file/candidate_good/frames/img_2209.png",
          },
        ],
        id: "e:/emulsion_workspace/candidate_good/frames/img_2025.png",
        label: "img_2025.png",
        name: "e:/emulsion_workspace/candidate_good/frames/img_2025.png",
      },
      {
        edges: [
          {
            destination:
              "e:/emulsion_workspace/candidate_good/frames/img_1759.png",
            from: "e:/emulsion_workspace/candidate_good/frames/img_1757.png",
            fromPath: "/file/candidate_good/frames/img_1757.png",
            id: "img_1757_to_img_1759.webm",
            path: "/file/candidate_good/tweens/img_1757_to_img_1759.webm",
            to: "e:/emulsion_workspace/candidate_good/frames/img_1759.png",
            toPath: "/file/candidate_good/frames/img_1759.png",
          },
          {
            destination:
              "e:/emulsion_workspace/candidate_good/frames/img_2025.png",
            from: "e:/emulsion_workspace/candidate_good/frames/img_1757.png",
            fromPath: "/file/candidate_good/frames/img_1757.png",
            id: "1757_thru_2025.webm",
            path: "/file/candidate_good/output/1757_thru_2025.webm",
            to: "e:/emulsion_workspace/candidate_good/frames/img_2025.png",
            toPath: "/file/candidate_good/frames/img_2025.png",
          },
        ],
        id: "e:/emulsion_workspace/candidate_good/frames/img_1757.png",
        label: "img_1757.png",
        name: "e:/emulsion_workspace/candidate_good/frames/img_1757.png",
      },
      {
        edges: [
          {
            destination:
              "e:/emulsion_workspace/candidate_good/frames/img_1523.png",
            from: "e:/emulsion_workspace/candidate_good/frames/img_1521.png",
            fromPath: "/file/candidate_good/frames/img_1521.png",
            id: "img_1521_to_img_1523.webm",
            path: "/file/candidate_good/tweens/img_1521_to_img_1523.webm",
            to: "e:/emulsion_workspace/candidate_good/frames/img_1523.png",
            toPath: "/file/candidate_good/frames/img_1523.png",
          },
          {
            destination:
              "e:/emulsion_workspace/candidate_good/frames/img_1757.png",
            from: "e:/emulsion_workspace/candidate_good/frames/img_1521.png",
            fromPath: "/file/candidate_good/frames/img_1521.png",
            id: "1521_thru_1757.webm",
            path: "/file/candidate_good/output/1521_thru_1757.webm",
            to: "e:/emulsion_workspace/candidate_good/frames/img_1757.png",
            toPath: "/file/candidate_good/frames/img_1757.png",
          },
        ],
        id: "e:/emulsion_workspace/candidate_good/frames/img_1521.png",
        label: "img_1521.png",
        name: "e:/emulsion_workspace/candidate_good/frames/img_1521.png",
      },
      {
        edges: [
          {
            destination:
              "e:/emulsion_workspace/candidate_good/frames/img_1408.png",
            from: "e:/emulsion_workspace/candidate_good/frames/img_1394.png",
            fromPath: "/file/candidate_good/frames/img_1394.png",
            id: "img_1394_to_img_1408.webm",
            path: "/file/candidate_good/tweens/img_1394_to_img_1408.webm",
            to: "e:/emulsion_workspace/candidate_good/frames/img_1408.png",
            toPath: "/file/candidate_good/frames/img_1408.png",
          },
          {
            destination:
              "e:/emulsion_workspace/candidate_good/frames/img_1521.png",
            from: "e:/emulsion_workspace/candidate_good/frames/img_1394.png",
            fromPath: "/file/candidate_good/frames/img_1394.png",
            id: "1394_thru_1521.webm",
            path: "/file/candidate_good/output/1394_thru_1521.webm",
            to: "e:/emulsion_workspace/candidate_good/frames/img_1521.png",
            toPath: "/file/candidate_good/frames/img_1521.png",
          },
        ],
        id: "e:/emulsion_workspace/candidate_good/frames/img_1394.png",
        label: "img_1394.png",
        name: "e:/emulsion_workspace/candidate_good/frames/img_1394.png",
      },
      {
        edges: [
          {
            destination:
              "e:/emulsion_workspace/candidate_good/frames/img_1221.png",
            from: "e:/emulsion_workspace/candidate_good/frames/img_1209.png",
            fromPath: "/file/candidate_good/frames/img_1209.png",
            id: "img_1209_to_img_1221.webm",
            path: "/file/candidate_good/tweens/img_1209_to_img_1221.webm",
            tags: ["idle"],
            to: "e:/emulsion_workspace/candidate_good/frames/img_1221.png",
            toPath: "/file/candidate_good/frames/img_1221.png",
          },
          {
            destination:
              "e:/emulsion_workspace/candidate_good/frames/img_1394.png",
            from: "e:/emulsion_workspace/candidate_good/frames/img_1209.png",
            fromPath: "/file/candidate_good/frames/img_1209.png",
            id: "img_1209_to_img_1394.webm",
            path: "/file/candidate_good/tweens/img_1209_to_img_1394.webm",
            tags: ["next"],
            to: "e:/emulsion_workspace/candidate_good/frames/img_1394.png",
            toPath: "/file/candidate_good/frames/img_1394.png",
          },
        ],
        id: "e:/emulsion_workspace/candidate_good/frames/img_1209.png",
        label: "img_1209.png",
        name: "e:/emulsion_workspace/candidate_good/frames/img_1209.png",
      },
      {
        edges: [
          {
            destination:
              "e:/emulsion_workspace/candidate_good/frames/img_0538.png",
            from: "e:/emulsion_workspace/candidate_good/frames/img_0537.png",
            fromPath: "/file/candidate_good/frames/img_0537.png",
            id: "img_0537_to_img_0538.webm",
            path: "/file/candidate_good/tweens/img_0537_to_img_0538.webm",
            tags: ["idle"],
            to: "e:/emulsion_workspace/candidate_good/frames/img_0538.png",
            toPath: "/file/candidate_good/frames/img_0538.png",
          },
          {
            destination:
              "e:/emulsion_workspace/candidate_good/frames/img_1209.png",
            from: "e:/emulsion_workspace/candidate_good/frames/img_0537.png",
            fromPath: "/file/candidate_good/frames/img_0537.png",
            id: "537_thru_1209.webm",
            path: "/file/candidate_good/output/537_thru_1209.webm",
            tags: ["next"],
            to: "e:/emulsion_workspace/candidate_good/frames/img_1209.png",
            toPath: "/file/candidate_good/frames/img_1209.png",
          },
        ],
        id: "e:/emulsion_workspace/candidate_good/frames/img_0537.png",
        label: "img_0537.png",
        name: "e:/emulsion_workspace/candidate_good/frames/img_0537.png",
      },
      {
        edges: [
          {
            destination:
              "e:/emulsion_workspace/candidate_good/frames/img_0287.png",
            from: "e:/emulsion_workspace/candidate_good/frames/img_0281.png",
            fromPath: "/file/candidate_good/frames/img_0281.png",
            id: "img_0281_to_img_0287.webm",
            mask: [{
              matchPixel(pixel) { return pixel[1] > 0; },
              name: 'handle'
            }],
            path: "/file/candidate_good/tweens/img_0281_to_img_0287.webm",
            tags: ["idle"],
            to: "e:/emulsion_workspace/candidate_good/frames/img_0287.png",
            toPath: "/file/candidate_good/frames/img_0287.png",
          },
          {
            mask: [{
              matchPixel(pixel) { return pixel[1] > 0; },
              name: 'handle'
            }],
              destination:  "e:/emulsion_workspace/candidate_good/frames/img_0537.png",
            from: "e:/emulsion_workspace/candidate_good/frames/img_0281.png",
            fromPath: "/file/candidate_good/frames/img_0281.png",
            id: "281_thru_537.webm",
            path: "/file/candidate_good/output/281_thru_537.webm",
            tags: ["next"],
            to: "e:/emulsion_workspace/candidate_good/frames/img_0537.png",
            toPath: "/file/candidate_good/frames/img_0537.png",
          },
        ],
        id: "e:/emulsion_workspace/candidate_good/frames/img_0281.png",
        label: "img_0281.png",
        mask: [{
          matchPixel(pixel) { return pixel[1] > 0; },
          name: 'handle'
        }],
        name: "e:/emulsion_workspace/candidate_good/frames/img_0281.png",
      },
      {
        edges: [
          {
            destination:
              "e:/emulsion_workspace/candidate_good/frames/img_0004.png",
            from: "e:/emulsion_workspace/candidate_good/frames/img_0001.png",
            fromPath: "/file/candidate_good/frames/img_0001.png",
            id: "img_0001_to_img_0004.webm",
            path: "/file/candidate_good/tweens/img_0001_to_img_0004.webm",
            tags: ["idle"],
            to: "e:/emulsion_workspace/candidate_good/frames/img_0004.png",
            toPath: "/file/candidate_good/frames/img_0004.png",
          },
          {
            destination:
              "e:/emulsion_workspace/candidate_good/frames/img_0281.png",
            from: "e:/emulsion_workspace/candidate_good/frames/img_0001.png",
            fromPath: "/file/candidate_good/frames/img_0001.png",
            id: "1_thru_281.webm",
            path: "/file/candidate_good/output/1_thru_281.webm",
            tags: ["next", "tag"],
            to: "e:/emulsion_workspace/candidate_good/frames/img_0281.png",
            toPath: "/file/candidate_good/frames/img_0281.png",
          },
        ],
        id: "e:/emulsion_workspace/candidate_good/frames/img_0001.png",
        label: "img_0001.png",
        name: "e:/emulsion_workspace/candidate_good/frames/img_0001.png",
      },
    ],
  },
},
    ],
  },
  getPlaygraph(name) {
    try {
      return window.Playgraph.playgraphs[name][0];
    } catch (exc) {
      alert("Playgraph not found: " + name);
    }
  },
};

// next up is controls and exporting graph from emulsion like this
